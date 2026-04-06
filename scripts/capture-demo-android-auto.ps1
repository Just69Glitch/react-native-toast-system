param(
  [string]$DeviceId,
  [int]$RecordSec = 95,
  [int]$BitRateMbps = 8,
  [string]$OutputDir = "artifacts",
  [string]$BaseName = "capture-demo-auto",
  [string]$LaunchPackage = "host.exp.exponent",
  [string]$DeepLinkUrl,
  [string]$ExpoDevUrl,
  [string]$HostIp,
  [int]$MetroPort = 8081,
  [string]$CaptureRoute = "capture-demo",
  [string]$CaptureQuery = "autoStart=1",
  [ValidateSet("raw", "basic", "full")]
  [string]$AssetProfile = "full",
  [switch]$ConvertGif,
  [switch]$ConvertVideo,
  [int]$RecordFps = 30,
  [int]$GifWidth = 720,
  [int]$GifFps = 32,
  [int]$WebFps = 30,
  [int]$WebCrf = 23,
  [int]$MarkerPadFrames = 2,
  [switch]$NoSplit,
  [switch]$KeepRemote,
  [switch]$NonInteractive
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[auto-capture] $Message" -ForegroundColor Cyan
}

function Write-WarnText {
  param([string]$Message)
  Write-Host "[auto-capture][warn] $Message" -ForegroundColor Yellow
}

function Fail {
  param([string]$Message)
  throw $Message
}

function Ensure-Directory {
  param([string]$PathValue)
  if (-not (Test-Path -LiteralPath $PathValue)) {
    New-Item -ItemType Directory -Path $PathValue -Force | Out-Null
  }
}

function Get-AdbPath {
  $cmd = Get-Command adb -ErrorAction SilentlyContinue
  if (-not $cmd) {
    Fail "adb was not found in PATH. Install Android platform-tools and reopen shell."
  }
  return $cmd.Source
}

function Get-ConnectedDevices {
  param([string]$AdbPath)
  $lines = & $AdbPath devices
  $devices = @()
  foreach ($line in $lines) {
    if ($line -match "^(?<id>\S+)\s+device$") {
      $devices += $Matches["id"]
    }
  }
  return $devices
}

function Get-DeviceLabel {
  param(
    [string]$AdbPath,
    [string]$DeviceId
  )
  if ($DeviceId.StartsWith("emulator-")) {
    return "$DeviceId (emulator)"
  }
  $model = $null
  try {
    $model = (& $AdbPath -s $DeviceId shell getprop ro.product.model 2>$null | Out-String).Trim()
  } catch {
    $model = $null
  }
  if ($model) {
    return "$DeviceId ($model)"
  }
  return $DeviceId
}

function Resolve-TargetDevice {
  param(
    [string]$AdbPath,
    [string]$RequestedDeviceId,
    [bool]$IsNonInteractive
  )
  $devices = Get-ConnectedDevices -AdbPath $AdbPath
  if ($devices.Count -eq 0) {
    Fail "No Android device detected. Connect phone or start emulator first."
  }
  if ($RequestedDeviceId) {
    if ($devices -notcontains $RequestedDeviceId) {
      Fail "Requested device '$RequestedDeviceId' is not connected. Connected: $($devices -join ', ')"
    }
    return $RequestedDeviceId
  }
  if ($devices.Count -eq 1) {
    return $devices[0]
  }
  if ($IsNonInteractive) {
    Write-Host ""
    Write-Host "Multiple devices detected (non-interactive mode)." -ForegroundColor Yellow
    foreach ($id in $devices) {
      Write-Host " - $(Get-DeviceLabel -AdbPath $AdbPath -DeviceId $id)"
    }
    Fail "Ambiguous target device. Pass -DeviceId with -NonInteractive."
  }

  Write-Host ""
  Write-Host "Multiple devices detected. Select a target device:" -ForegroundColor Yellow
  for ($i = 0; $i -lt $devices.Count; $i += 1) {
    Write-Host (" [{0}] {1}" -f ($i + 1), (Get-DeviceLabel -AdbPath $AdbPath -DeviceId $devices[$i]))
  }
  for ($attempt = 1; $attempt -le 3; $attempt += 1) {
    $selectionInput = Read-Host "Enter device number (1-$($devices.Count)) or exact id"
    if ($null -eq $selectionInput) {
      Write-WarnText "No selection entered."
      continue
    }
    $selection = $selectionInput.Trim()
    if (-not $selection) {
      Write-WarnText "No selection entered."
      continue
    }
    if ($selection -match "^\d+$") {
      $index = [int]$selection - 1
      if ($index -ge 0 -and $index -lt $devices.Count) {
        return $devices[$index]
      }
    } elseif ($devices -contains $selection) {
      return $selection
    }
    Write-WarnText "Invalid selection: '$selection'"
  }
  Fail "Could not resolve device selection."
}

function Get-FFmpegPath {
  $ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if (-not $ffmpeg) {
    return $null
  }
  return $ffmpeg.Source
}

function Resolve-AssetToggles {
  param(
    [string]$Profile,
    [bool]$ForceVideo,
    [bool]$ForceGif
  )
  $video = $false
  $gif = $false
  switch ($Profile) {
    "raw" {}
    "basic" {
      $video = $true
    }
    "full" {
      $video = $true
      $gif = $true
    }
  }
  if ($ForceVideo) { $video = $true }
  if ($ForceGif) { $gif = $true }
  return @{
    Video = $video
    Gif = $gif
  }
}

function Convert-ToWebVideo {
  param(
    [string]$FFmpegPath,
    [string]$InputPath,
    [string]$OutputPath,
    [int]$Crf,
    [int]$Fps
  )
  & $FFmpegPath -y -v error -i $InputPath -c:v libx264 -preset medium -vf "fps=${Fps}" -r "$Fps" -crf $Crf -movflags +faststart -pix_fmt yuv420p -an $OutputPath | Out-Null
}

function Convert-ToGif {
  param(
    [string]$FFmpegPath,
    [string]$InputPath,
    [string]$OutputPath,
    [int]$Width,
    [int]$Fps
  )
  $palettePath = [System.IO.Path]::Combine(
    [System.IO.Path]::GetDirectoryName($OutputPath),
    "{0}.palette.png" -f [System.IO.Path]::GetFileNameWithoutExtension($OutputPath)
  )
  & $FFmpegPath -y -v error -i $InputPath -vf "fps=${Fps},scale=${Width}:-1:flags=lanczos,palettegen" $palettePath | Out-Null
  & $FFmpegPath -y -v error -i $InputPath -i $palettePath -filter_complex "fps=${Fps},scale=${Width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" $OutputPath | Out-Null
  if (Test-Path -LiteralPath $palettePath) {
    Remove-Item -LiteralPath $palettePath -Force
  }
}

function Test-IsPrivateIPv4 {
  param([string]$IpAddress)
  if (-not $IpAddress) {
    return $false
  }
  if ($IpAddress -like "10.*" -or $IpAddress -like "192.168.*") {
    return $true
  }
  if ($IpAddress -match "^172\.(\d+)\.") {
    $octet = [int]$Matches[1]
    return $octet -ge 16 -and $octet -le 31
  }
  return $false
}

function Get-DetectedHostIp {
  param([string]$TargetDeviceId)
  if ($TargetDeviceId.StartsWith("emulator-")) {
    return "10.0.2.2"
  }

  $allAddresses = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName())
  $candidates = @()
  foreach ($address in $allAddresses) {
    if ($address.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
      continue
    }
    $ip = $address.IPAddressToString
    if ($ip.StartsWith("127.") -or $ip.StartsWith("169.254.")) {
      continue
    }
    if (-not (Test-IsPrivateIPv4 -IpAddress $ip)) {
      continue
    }
    $candidates += $ip
  }

  if ($candidates.Count -eq 0) {
    return $null
  }

  return $candidates[0]
}

function Ensure-CaptureRoute {
  param(
    [string]$BaseUrl,
    [string]$Route,
    [string]$Query
  )
  $trimmed = $BaseUrl.TrimEnd("/")
  $normalizedRoute = $Route.Trim().TrimStart("/")
  if (-not $normalizedRoute) {
    $normalizedRoute = "capture-demo"
  }

  if ($trimmed -notmatch "/--/") {
    $trimmed = "$trimmed/--/$normalizedRoute"
  } elseif ($trimmed -match "/--/$") {
    $trimmed = "$trimmed$normalizedRoute"
  }

  if (-not $Query) {
    return $trimmed
  }

  $normalizedQuery = $Query.Trim().TrimStart("?")
  if (-not $normalizedQuery) {
    return $trimmed
  }

  if ($trimmed -match "\?") {
    return "${trimmed}&${normalizedQuery}"
  }
  return "${trimmed}?${normalizedQuery}"
}

function Build-ExpoDevUrl {
  param(
    [string]$IpAddress,
    [int]$Port
  )
  return "exp://$($IpAddress):$Port"
}

function Resolve-DeepLinkTarget {
  param(
    [string]$ExplicitDeepLink,
    [string]$ExpoUrl,
    [string]$TargetDeviceId,
    [string]$ExplicitHostIp,
    [int]$Port,
    [string]$Route,
    [string]$Query
  )
  if ($ExplicitDeepLink) {
    return @{
      DeepLink = $ExplicitDeepLink
      ExpoUrl = ""
    }
  }

  $resolvedExpoBase = $null
  if ($ExpoUrl) {
    $resolvedExpoBase = $ExpoUrl.Trim()
  } else {
    $resolvedIp = $ExplicitHostIp
    if (-not $resolvedIp) {
      $resolvedIp = Get-DetectedHostIp -TargetDeviceId $TargetDeviceId
    }
    if ($resolvedIp) {
      $resolvedExpoBase = Build-ExpoDevUrl -IpAddress $resolvedIp -Port $Port
    }
  }

  if ($resolvedExpoBase) {
    $targetLink = Ensure-CaptureRoute -BaseUrl $resolvedExpoBase -Route $Route -Query $Query
    return @{
      DeepLink = $targetLink
      ExpoUrl = $resolvedExpoBase
    }
  }

  return @{
    DeepLink = "example://${Route}?${Query}"
    ExpoUrl = ""
  }
}

function Write-KeyValueFile {
  param(
    [string]$PathValue,
    [hashtable]$Values
  )
  $lines = @()
  foreach ($key in $Values.Keys) {
    $lines += "${key}: $($Values[$key])"
  }
  Set-Content -LiteralPath $PathValue -Value ($lines -join [Environment]::NewLine) -Encoding UTF8
}

function Stop-DeviceScreenRecord {
  param(
    [string]$AdbPath,
    [string]$DeviceIdValue
  )
  try {
    & $AdbPath -s $DeviceIdValue shell "pkill -INT -f screenrecord >/dev/null 2>&1 || true" | Out-Null
  } catch {
    # best effort
  }
  Start-Sleep -Milliseconds 180
  try {
    & $AdbPath -s $DeviceIdValue shell "killall -INT screenrecord >/dev/null 2>&1 || true" | Out-Null
  } catch {
    # best effort
  }
}

function Get-FreeTcpPort {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  $port = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
  $listener.Stop()
  return $port
}

function Get-HostFromExpoUrl {
  param([string]$ExpoUrl)
  if (-not $ExpoUrl) {
    return $null
  }
  if ($ExpoUrl -match "^exp://([^/:?]+)") {
    return $Matches[1]
  }
  return $null
}

function Append-QueryParam {
  param(
    [string]$Url,
    [string]$Name,
    [string]$Value
  )
  if (-not $Url) {
    return $Url
  }
  $encoded = [System.Uri]::EscapeDataString($Value)
  if ($Url -match "\?") {
    return "${Url}&${Name}=${encoded}"
  }
  return "${Url}?${Name}=${encoded}"
}

function Test-ScreenRecordSupportsFps {
  param(
    [string]$AdbPath,
    [string]$DeviceIdValue
  )
  try {
    $help = (& $AdbPath -s $DeviceIdValue shell screenrecord --help 2>&1 | Out-String)
    return $help -match "(^|\s)--fps(\s|$)"
  } catch {
    return $false
  }
}

$adbPath = Get-AdbPath
$targetDevice = Resolve-TargetDevice -AdbPath $adbPath -RequestedDeviceId $DeviceId -IsNonInteractive $NonInteractive.IsPresent
$deepLinkResolution = Resolve-DeepLinkTarget `
  -ExplicitDeepLink $DeepLinkUrl `
  -ExpoUrl $ExpoDevUrl `
  -TargetDeviceId $targetDevice `
  -ExplicitHostIp $HostIp `
  -Port $MetroPort `
  -Route $CaptureRoute `
  -Query $CaptureQuery
$deepLink = $deepLinkResolution.DeepLink
$resolvedExpoUrl = $deepLinkResolution.ExpoUrl
$toggles = Resolve-AssetToggles -Profile $AssetProfile -ForceVideo $ConvertVideo.IsPresent -ForceGif $ConvertGif.IsPresent
$ffmpegPath = Get-FFmpegPath

Ensure-Directory -PathValue $OutputDir
$outputAbsolute = (Resolve-Path -LiteralPath $OutputDir).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeDeviceId = $targetDevice -replace "[:/\\]", "_"
$runStem = "$BaseName-$timestamp-$safeDeviceId"
$runDir = Join-Path $outputAbsolute $runStem
$rawDir = Join-Path $runDir "raw"
$videoDir = Join-Path $runDir "videos"
$gifDir = Join-Path $runDir "gifs"
$metaDir = Join-Path $runDir "meta"
$segmentsDir = Join-Path $runDir "segments"
Ensure-Directory -PathValue $runDir
Ensure-Directory -PathValue $rawDir
Ensure-Directory -PathValue $videoDir
Ensure-Directory -PathValue $gifDir
Ensure-Directory -PathValue $metaDir
Ensure-Directory -PathValue $segmentsDir

$rawMp4 = Join-Path $rawDir "$runStem.raw.mp4"
$webMp4 = Join-Path $videoDir "$runStem.web.mp4"
$gifPath = Join-Path $gifDir "$runStem.gif"
$metaPath = Join-Path $metaDir "capture.txt"
$logcatPath = Join-Path $metaDir "logcat.txt"
$callbackOutputPath = Join-Path $metaDir "callback.json"
$callbackStdoutPath = Join-Path $metaDir "callback.stdout.txt"
$callbackStderrPath = Join-Path $metaDir "callback.stderr.txt"
$remoteMp4 = "/sdcard/Download/$runStem.raw.mp4"
$bitRate = $BitRateMbps * 1000000
$screenrecordFpsSupported = Test-ScreenRecordSupportsFps -AdbPath $adbPath -DeviceIdValue $targetDevice

$callbackHost = Get-HostFromExpoUrl -ExpoUrl $resolvedExpoUrl
$callbackUrl = $null
$callbackProcess = $null
if ($callbackHost) {
  $callbackPort = Get-FreeTcpPort
  $callbackUrl = "http://${callbackHost}:${callbackPort}/capture-complete"
}

if ($callbackUrl) {
  $deepLink = Append-QueryParam -Url $deepLink -Name "captureCallback" -Value $callbackUrl
}

$wmSize = (& $adbPath -s $targetDevice shell wm size 2>$null | Out-String).Trim()
Write-Step "Using device: $(Get-DeviceLabel -AdbPath $adbPath -DeviceId $targetDevice)"
if ($wmSize) {
  Write-Step "Device display: $wmSize"
}
Write-Step "Run folder: $runDir"
Write-Step "Output layout: raw/, videos/, gifs/, segments/, meta/"
if ($resolvedExpoUrl) {
  Write-Step "Expo URL: $resolvedExpoUrl"
}
Write-Step "Deep link: $deepLink"
if ($callbackUrl) {
  Write-Step "Callback URL: $callbackUrl"
}
Write-Step "Record duration: $RecordSec sec"
Write-Step "Record FPS request: $RecordFps$(if ($screenrecordFpsSupported) { ' (supported)' } else { ' (not supported by this device build)' })"
Write-Step "Asset profile: $AssetProfile (video=$($toggles.Video), gif=$($toggles.Gif))"
Write-Step "Web video FPS: $WebFps"
Write-Step "Marker trim padding: $MarkerPadFrames frame(s)"

if (($toggles.Video -or $toggles.Gif) -and (-not $ffmpegPath)) {
  Write-WarnText "ffmpeg not found. Converted assets and marker splitting will be limited."
}

& $adbPath -s $targetDevice shell rm -f $remoteMp4 2>$null | Out-Null
& $adbPath -s $targetDevice logcat -c 2>$null | Out-Null

if ($callbackUrl) {
  $timeoutSec = $RecordSec + 30
  $listenerArgs = @(
    "scripts/run-capture-demo-android-auto.js",
    "callback-listener",
    "--port", "$callbackPort",
    "--output", $callbackOutputPath,
    "--timeout-sec", "$timeoutSec"
  )
  Write-Step "Starting callback listener..."
  $callbackProcess = Start-Process -FilePath "node" -ArgumentList $listenerArgs -NoNewWindow -PassThru -RedirectStandardOutput $callbackStdoutPath -RedirectStandardError $callbackStderrPath
  Start-Sleep -Milliseconds 350
}

$recordArgs = @(
  "-s", $targetDevice,
  "shell", "screenrecord",
  "--bit-rate", "$bitRate",
  "--time-limit", "$RecordSec",
  $remoteMp4
)
if ($RecordFps -gt 0 -and $screenrecordFpsSupported) {
  $recordArgs = @(
    "-s", $targetDevice,
    "shell", "screenrecord",
    "--bit-rate", "$bitRate",
    "--time-limit", "$RecordSec",
    "--fps", "$RecordFps",
    $remoteMp4
  )
}

Write-Step "Starting ADB screenrecord..."
$recordProcess = Start-Process -FilePath $adbPath -ArgumentList $recordArgs -NoNewWindow -PassThru
Start-Sleep -Milliseconds 900

if ($LaunchPackage -and $LaunchPackage -ne "none") {
  Write-Step "Launching app package: $LaunchPackage"
  & $adbPath -s $targetDevice shell monkey -p $LaunchPackage -c android.intent.category.LAUNCHER 1 | Out-Null
  Start-Sleep -Milliseconds 800
}

Write-Step "Opening deep link route..."
$intentArgs = @(
  "-s", $targetDevice,
  "shell", "am", "start", "-W",
  "-a", "android.intent.action.VIEW",
  "-d", $deepLink
)
& $adbPath @intentArgs | Out-Null

Write-Step "Recording in progress (watching for queue-complete marker)..."
$deadline = (Get-Date).AddSeconds($RecordSec + 8)
$markerReason = ""
$sawMarker = $false
$latestLogSnapshot = ""

while (-not $recordProcess.HasExited) {
  Start-Sleep -Milliseconds 350

  if ($callbackProcess -and (Test-Path -LiteralPath $callbackOutputPath)) {
    try {
      $callbackPayload = Get-Content -LiteralPath $callbackOutputPath -Raw | ConvertFrom-Json
      if ($callbackPayload.status) {
        $markerReason = [string]$callbackPayload.status
        if ($markerReason -eq "queue-complete" -or $markerReason -eq "queue-error") {
          $sawMarker = $true
        }
      }
    } catch {
      # ignore parse errors and continue to fallback paths
    }
  }

  if (-not $sawMarker) {
    $logSnapshot = (& $adbPath -s $targetDevice logcat -d -v brief ReactNativeJS:V ReactNative:V '*:S' 2>$null | Out-String)
    if ($logSnapshot) {
      $latestLogSnapshot = $logSnapshot
      if ($logSnapshot.Contains("[capture-demo-marker]")) {
        if ($logSnapshot.Contains('"event":"queue-complete"')) {
          $markerReason = "queue-complete(logcat)"
          $sawMarker = $true
        } elseif ($logSnapshot.Contains('"event":"queue-error"')) {
          $markerReason = "queue-error(logcat)"
          $sawMarker = $true
        }
      }
    }
  }

  if ($sawMarker) {
    Write-Step "Detected marker '$markerReason'; stopping recording early."
    Stop-DeviceScreenRecord -AdbPath $adbPath -DeviceIdValue $targetDevice
    Start-Sleep -Milliseconds 450
    if (-not $recordProcess.HasExited) {
      try {
        $recordProcess.Kill()
      } catch {
        # best effort
      }
    }
    break
  }

  if ((Get-Date) -gt $deadline) {
    Write-WarnText "Recording exceeded watchdog window; forcing stop."
    Stop-DeviceScreenRecord -AdbPath $adbPath -DeviceIdValue $targetDevice
    Start-Sleep -Milliseconds 450
    if (-not $recordProcess.HasExited) {
      try {
        $recordProcess.Kill()
      } catch {
        # best effort
      }
    }
    break
  }
}

if ($latestLogSnapshot) {
  Set-Content -LiteralPath $logcatPath -Value $latestLogSnapshot -Encoding UTF8
}

if ($callbackProcess -and -not $callbackProcess.HasExited) {
  try {
    $callbackProcess.Kill()
  } catch {
    # best effort
  }
}

Write-Step "Pulling recording..."
& $adbPath -s $targetDevice pull $remoteMp4 $rawMp4 | Out-Null
if (-not (Test-Path -LiteralPath $rawMp4)) {
  Fail "Failed to pull recording from device path: $remoteMp4"
}
if (-not $KeepRemote) {
  & $adbPath -s $targetDevice shell rm -f $remoteMp4 2>$null | Out-Null
}

$actualWeb = $null
$actualGif = $null

if (($toggles.Video -or $toggles.Gif) -and (-not $ffmpegPath)) {
  Write-WarnText "Skipping converted outputs because ffmpeg is missing."
} else {
  if ($toggles.Video) {
    Write-Step "Creating web MP4..."
    Convert-ToWebVideo -FFmpegPath $ffmpegPath -InputPath $rawMp4 -OutputPath $webMp4 -Crf $WebCrf -Fps $WebFps
    if (Test-Path -LiteralPath $webMp4) { $actualWeb = $webMp4 }
  }

  $gifInput = if ($actualWeb) { $actualWeb } else { $rawMp4 }
  if ($toggles.Gif) {
    Write-Step "Creating GIF..."
    Convert-ToGif -FFmpegPath $ffmpegPath -InputPath $gifInput -OutputPath $gifPath -Width $GifWidth -Fps $GifFps
    if (Test-Path -LiteralPath $gifPath) { $actualGif = $gifPath }
  }
}

$splitManifest = $null
if (-not $NoSplit) {
  $splitInput = if ($actualWeb) { $actualWeb } else { $rawMp4 }
  Write-Step "Splitting segments by red/green frame markers..."
  $splitArgs = @(
    "scripts/run-capture-demo-android-auto.js",
    "split-markers",
    "--input", $splitInput,
    "--output-dir", $segmentsDir,
    "--base-name", "capture-segment",
    "--gif-width", "$GifWidth",
    "--gif-fps", "$GifFps",
    "--web-fps", "$WebFps",
    "--web-crf", "$WebCrf",
    "--marker-pad-frames", "$MarkerPadFrames"
  )
  if (-not $toggles.Gif) {
    $splitArgs += "--no-gif"
  }
  & node @splitArgs
  if ($LASTEXITCODE -ne 0) {
    Write-WarnText "Marker splitting failed. Raw and converted outputs are still available."
  } else {
    $splitManifest = Join-Path $segmentsDir "meta/manifest.json"
  }
}

Write-KeyValueFile -PathValue $metaPath -Values @{
  capture_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  device_id = $targetDevice
  deep_link = $deepLink
  expo_url = $resolvedExpoUrl
  host_ip = $HostIp
  metro_port = $MetroPort
  capture_route = $CaptureRoute
  capture_query = $CaptureQuery
  stop_reason = $(if ($sawMarker) { $markerReason } else { "timeout-or-watchdog" })
  callback_url = $callbackUrl
  record_sec = $RecordSec
  record_fps_requested = $RecordFps
  record_fps_supported = $screenrecordFpsSupported
  web_fps = $WebFps
  marker_pad_frames = $MarkerPadFrames
  run_dir = $runDir
  raw_mp4 = $rawMp4
  web_mp4 = $(if ($actualWeb) { $actualWeb } else { "" })
  gif = $(if ($actualGif) { $actualGif } else { "" })
  split_manifest = $(if ($splitManifest) { $splitManifest } else { "" })
}

Write-Host ""
Write-Host "Auto capture complete." -ForegroundColor Green
Write-Host " - Run:       $runDir"
Write-Host " - Raw MP4:   $rawMp4"
if ($actualWeb) { Write-Host " - Web MP4:   $actualWeb" }
if ($actualGif) { Write-Host " - GIF:       $actualGif" }
if ($splitManifest) { Write-Host " - Segments:  $segmentsDir" }
Write-Host " - Metadata:  $metaPath"
