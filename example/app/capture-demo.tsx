import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ToastNativeSurfaceBoundary,
  ToastViewport,
} from "react-native-toast-system/components";
import { useToast } from "react-native-toast-system/hooks";
import type {
  ToastController,
  ToastOptions,
} from "react-native-toast-system/types";

const RED_MARKER = "#FF0000";
const GREEN_MARKER = "#00FF00";
const MARKER_DURATION_MS = 1000;
const UI_STABILIZE_MS = 500;
const PRE_TASK_IDLE_MS = 500;
const POST_RED_IDLE_MS = 500;
const POST_TASK_IDLE_MS = 500;
const MARKER_COVER_APPLY_MS = 80;
const SURFACE_OPEN_DELAY_MS = 700;
const SURFACE_CLOSE_HOLD_MS = 320;
const SURFACE_POST_CLOSE_SETTLE_MS = 280;
const DEFAULT_TIMEOUT_MS = 15000;

type MarkerColor = null | typeof RED_MARKER | typeof GREEN_MARKER;

interface DemoDefinition {
  id: string;
  description: string;
  setup?: () => Promise<boolean | void> | boolean | void;
  run: () => Promise<void> | void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTruthyParam(value: unknown): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  if (Array.isArray(value)) {
    return value.some((entry) => isTruthyParam(entry));
  }
  return false;
}

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export default function CaptureDemoScreen() {
  const params = useLocalSearchParams<{
    autoStart?: string | string[];
    captureCallback?: string | string[];
  }>();
  const shouldAutoStart = isTruthyParam(params.autoStart);
  const callbackBase = useMemo(() => {
    const raw =
      typeof params.captureCallback === "string"
        ? params.captureCallback
        : Array.isArray(params.captureCallback)
          ? params.captureCallback[0]
          : "";
    return raw?.trim() ?? "";
  }, [params.captureCallback]);

  const rootToast = useToast("capture-root");
  const modalToast = useToast("capture-modal");
  const sheetToast = useToast("capture-sheet");

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [segmentTotal, setSegmentTotal] = useState(0);
  const [description, setDescription] = useState(
    "Press Start Demo to run capture mode.",
  );
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [previewDirection, setPreviewDirection] = useState<"ltr" | "rtl">(
    "ltr",
  );
  const [markerColor, setMarkerColor] = useState<MarkerColor>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [keyboardProbeVisible, setKeyboardProbeVisible] = useState(false);
  const keyboardInputRef = useRef<TextInput | null>(null);
  const autoStartFiredRef = useRef(false);

  const toastDefaults = useMemo<Partial<ToastOptions>>(
    () => ({
      animationPreset: "snappy",
      animationDuration: 180,
      pauseOnPress: false,
      pauseOnDrag: false,
      dismissOnPress: false,
      dismissible: false,
      keyboardAvoidance: true,
      keyboardOffset: 8,
    }),
    [],
  );

  const hostConfig = useMemo(
    () => ({
      animationPreset: "snappy" as const,
      animationDuration: 180,
      pauseOnDrag: false,
      pauseOnPress: false,
      dismissible: false,
      position: "top" as const,
      interactionMode: "classic" as const,
      keyboardAvoidance: true,
      keyboardOffset: 8,
      theme: previewTheme,
      direction: previewDirection,
    }),
    [previewDirection, previewTheme],
  );

  const logMarker = useCallback(
    (
      event: string,
      extra?: {
        id?: string;
        description?: string;
        marker?: "red" | "green";
        index?: number;
      },
    ) => {
      const payload = {
        event,
        ts: Date.now(),
        ...(extra ?? {}),
      };
      console.log(`[capture-demo-marker] ${JSON.stringify(payload)}`);
    },
    [],
  );

  const notifyCaptureCallback = useCallback(
    (status: string) => {
      if (!callbackBase) {
        return;
      }
      const separator = callbackBase.includes("?") ? "&" : "?";
      const target = `${callbackBase}${separator}status=${encodeURIComponent(status)}&ts=${Date.now()}`;
      void fetch(target).catch(() => {
        // best effort callback signal for recorder script
      });
    },
    [callbackBase],
  );

  const showToastAndWait = useCallback(
    (
      controller: ToastController,
      options: ToastOptions,
      timeoutMs: number = DEFAULT_TIMEOUT_MS,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        let settled = false;
        const timeout = setTimeout(() => {
          if (settled) {
            return;
          }
          settled = true;
          reject(
            new Error(
              `Timed out waiting for toast dismissal (host=${controller.hostId ?? "root"})`,
            ),
          );
        }, timeoutMs);

        const finish = () => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timeout);
          resolve();
        };

        const originalOnOpen = options.onOpen;
        const originalOnDismiss = options.onDismiss;

        controller.show({
          ...toastDefaults,
          ...options,
          onOpen: (context) => {
            originalOnOpen?.(context);
          },
          onDismiss: (context) => {
            originalOnDismiss?.(context);
            finish();
          },
        });
      });
    },
    [toastDefaults],
  );

  const settleSurfaceState = useCallback(async () => {
    setModalVisible(false);
    setSheetVisible(false);
    setKeyboardProbeVisible(false);
    keyboardInputRef.current?.blur();
    Keyboard.dismiss();
    await wait(280);
  }, []);

  const runDemoQueue = useCallback(async () => {
    if (running) {
      return;
    }

    setRunning(true);
    setDone(false);
    setDescription("Initializing deterministic capture mode...");
    setSegmentIndex(0);
    setPreviewTheme("dark");
    setPreviewDirection("ltr");

    const demos: DemoDefinition[] = [
      {
        id: "root-success",
        description: "Root host success toast",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          await showToastAndWait(rootToast, {
            title: "Saved successfully",
            description: "Root host deterministic toast.",
            variant: "success",
            duration: 1700,
          });
        },
      },
      {
        id: "light-theme-preview",
        description: "Light theme toast preview",
        setup: async () => {
          await settleSurfaceState();
          setPreviewTheme("light");
          await wait(320);
          return false;
        },
        run: async () => {
          await showToastAndWait(rootToast, {
            title: "Light theme preview",
            description: "Toast uses light theme for this segment.",
            variant: "info",
            duration: 2100,
          });
          await wait(220);
          setPreviewTheme("dark");
          await wait(220);
        },
      },
      {
        id: "rtl-preview",
        description: "RTL Arabic toast preview",
        setup: async () => {
          await settleSurfaceState();
          setPreviewDirection("rtl");
          await wait(320);
          return false;
        },
        run: async () => {
          await showToastAndWait(rootToast, {
            title: "تم الحفظ بنجاح",
            description: "يظهر هذا الإشعار باتجاه RTL مع نص عربي.",
            variant: "success",
            duration: 2100,
          });
          await wait(220);
          setPreviewDirection("ltr");
          await wait(220);
        },
      },
      {
        id: "modal-host",
        description: "Modal host scoped toast",
        setup: async () => {
          await settleSurfaceState();
          setModalVisible(true);
          await wait(SURFACE_OPEN_DELAY_MS);
          return false;
        },
        run: async () => {
          await showToastAndWait(modalToast, {
            title: "Modal scoped error",
            description: "Rendered inside modal host.",
            variant: "error",
            duration: 1800,
          });
          await wait(SURFACE_CLOSE_HOLD_MS);
          setModalVisible(false);
          await wait(SURFACE_POST_CLOSE_SETTLE_MS);
        },
      },
      {
        id: "sheet-host",
        description: "Top sheet host scoped toast",
        setup: async () => {
          await settleSurfaceState();
          setSheetVisible(true);
          await wait(SURFACE_OPEN_DELAY_MS);
          return false;
        },
        run: async () => {
          await showToastAndWait(sheetToast, {
            title: "Sheet scoped warning",
            description: "Rendered inside sheet host.",
            variant: "warning",
            duration: 1800,
          });
          await wait(SURFACE_CLOSE_HOLD_MS);
          setSheetVisible(false);
          await wait(SURFACE_POST_CLOSE_SETTLE_MS);
        },
      },
      {
        id: "keyboard-bottom",
        description: "Keyboard-aware bottom toast",
        setup: async () => {
          await settleSurfaceState();
          setKeyboardProbeVisible(true);
          return true;
        },
        run: async () => {
          keyboardInputRef.current?.focus();
          await wait(360);

          await showToastAndWait(rootToast, {
            title: "Keyboard overlap check",
            description: "Bottom toast stays visible above keyboard.",
            variant: "default",
            position: "bottom",
            keyboardAvoidance: true,
            keyboardOffset: 8,
            duration: 1800,
          });

          keyboardInputRef.current?.blur();
          Keyboard.dismiss();
          setKeyboardProbeVisible(false);
          await wait(220);
        },
      },
      {
        id: "actions-preview",
        description: "Action buttons preview",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          await showToastAndWait(rootToast, {
            title: "Payment failed",
            description: "Try again or view more details.",
            variant: "error",
            duration: 2200,
            actions: [{ label: "Retry" }, { label: "Details" }],
          });
        },
      },
      {
        id: "dedupe-ignore",
        description: "Dedupe ignores duplicate emission",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          const completion = showToastAndWait(rootToast, {
            title: "Retrying sync",
            description: "Only one toast should remain visible.",
            variant: "info",
            dedupeKey: "capture-dedupe-ignore",
            dedupeMode: "ignore",
            duration: 2000,
          });

          await wait(120);
          rootToast.show({
            ...toastDefaults,
            title: "Retrying sync duplicate",
            description: "This second trigger is deduped.",
            variant: "info",
            dedupeKey: "capture-dedupe-ignore",
            dedupeMode: "ignore",
            duration: 2000,
          });

          await completion;
        },
      },
      {
        id: "promise-success",
        description: "Promise loading -> success lifecycle",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          const doneSignal = createDeferred<void>();

          await rootToast.promise(
            new Promise<string>((resolve) => {
              setTimeout(() => resolve("Upload completed"), 900);
            }),
            {
              loading: {
                title: "Uploading...",
                description: "Waiting for server response.",
              },
              success: (value) => ({
                title: "Success",
                description: value,
                variant: "success",
                duration: 1700,
              }),
              error: (error) => ({
                title: "Error",
                description: String(error),
                variant: "error",
                duration: 1700,
              }),
            },
            {
              ...toastDefaults,
              duration: 1700,
              onDismiss: () => {
                doneSignal.resolve();
              },
            },
          );

          await doneSignal.promise;
        },
      },
      {
        id: "long-content",
        description: "Long content wrapping",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          await showToastAndWait(rootToast, {
            title: "Your workspace sync is taking longer than usual",
            description:
              "You can keep using the app while we finish background reconciliation and refresh stale records safely.",
            variant: "info",
            duration: 2600,
          });
        },
      },
      {
        id: "group-update",
        description: "In-group update flow",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          const completion = showToastAndWait(rootToast, {
            title: "Sync in progress",
            description: "Preparing updates for your account.",
            variant: "loading",
            template: "banner",
            groupId: "capture-group-update",
            groupBehavior: "update-in-group",
            duration: 2300,
          });

          await wait(700);
          rootToast.show({
            ...toastDefaults,
            title: "Sync complete",
            description: "All updates were applied successfully.",
            variant: "success",
            template: "banner",
            groupId: "capture-group-update",
            groupBehavior: "update-in-group",
            duration: 1500,
          });

          await completion;
        },
      },
      {
        id: "programmatic-loading",
        description: "Programmatic loading -> update",
        setup: async () => {
          await settleSurfaceState();
          return true;
        },
        run: async () => {
          const doneSignal = createDeferred<void>();

          const toastId = rootToast.show({
            ...toastDefaults,
            title: "Importing records...",
            description: "Please wait while data is processed.",
            variant: "loading",
            persistent: true,
            onDismiss: () => {
              doneSignal.resolve();
            },
          });

          await wait(900);
          rootToast.update(toastId, {
            title: "Import complete",
            description: "Records were imported successfully.",
            variant: "success",
            persistent: false,
            duration: 1600,
          });

          await doneSignal.promise;
        },
      },
    ];

    setSegmentTotal(demos.length);
    logMarker("queue-start", { description: "capture queue start" });
    notifyCaptureCallback("queue-start");

    try {
      for (let index = 0; index < demos.length; index += 1) {
        const demo = demos[index];
        const clipIndex = index + 1;

        if (index > 0) {
          await wait(PRE_TASK_IDLE_MS);
        }

        logMarker("segment-marker", {
          marker: "red",
          id: demo.id,
          description: demo.description,
          index: clipIndex,
        });
        setMarkerColor(RED_MARKER);
        await wait(MARKER_COVER_APPLY_MS);
        setSegmentIndex(clipIndex);
        setDescription(demo.description);
        await wait(Math.max(0, MARKER_DURATION_MS - MARKER_COVER_APPLY_MS));
        setMarkerColor(null);
        await wait(POST_RED_IDLE_MS);

        const setupChanged = (await demo.setup?.()) ?? false;
        if (setupChanged) {
          await wait(UI_STABILIZE_MS);
        }

        logMarker("segment-run", {
          id: demo.id,
          description: demo.description,
          index: clipIndex,
        });
        await demo.run();
        logMarker("segment-complete", {
          id: demo.id,
          description: demo.description,
          index: clipIndex,
        });
        await wait(POST_TASK_IDLE_MS);
      }

      setDescription("Queue complete.");
      logMarker("queue-marker", { marker: "green" });
      setMarkerColor(GREEN_MARKER);
      await wait(MARKER_DURATION_MS);
      setMarkerColor(null);
      logMarker("queue-complete", { description: "capture queue complete" });
      notifyCaptureCallback("queue-complete");
      setDone(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDescription(`Capture queue failed: ${message}`);
      logMarker("queue-error", { description: message });
      notifyCaptureCallback("queue-error");
      setDone(false);
    } finally {
      await settleSurfaceState();
      setRunning(false);
    }
  }, [
    logMarker,
    modalToast,
    notifyCaptureCallback,
    rootToast,
    running,
    settleSurfaceState,
    sheetToast,
    showToastAndWait,
    toastDefaults,
  ]);

  useEffect(() => {
    if (!shouldAutoStart || autoStartFiredRef.current || running) {
      return;
    }
    autoStartFiredRef.current = true;
    void runDemoQueue();
  }, [runDemoQueue, running, shouldAutoStart]);

  return (
    <View style={styles.screen}>
      <StatusBar hidden />

      <View style={styles.content}>
        <Text style={styles.title}>Demo Preview</Text>
        <Text style={styles.subtitle}>
          See toasts stay in the right place across screens, modals, and sheets.
        </Text>

        {markerColor ? null : (
          <View style={styles.overlayCard}>
            <Text style={styles.segmentLabel}>
              {segmentTotal > 0
                ? `Segment ${segmentIndex}/${segmentTotal}`
                : "Segment -/-"}
            </Text>
            <Text style={styles.description}>{description}</Text>
            {!running && (
              <Pressable
                disabled={running}
                onPress={() => {
                  void runDemoQueue();
                }}
                style={[styles.button, running ? styles.buttonDisabled : null]}
              >
                <Text style={styles.buttonText}>Start Demo</Text>
              </Pressable>
            )}
            {done ? <Text style={styles.doneLabel}>Done</Text> : null}
          </View>
        )}
      </View>

      {keyboardProbeVisible ? (
        <View style={styles.keyboardProbe}>
          <TextInput
            ref={keyboardInputRef}
            style={styles.keyboardInput}
            value="capture"
            onChangeText={() => {}}
            autoCorrect={false}
          />
        </View>
      ) : null}

      <ToastViewport
        hostId="capture-root"
        interactionMode="classic"
        config={hostConfig}
      />

      <Modal visible={modalVisible} transparent animationType="none">
        <ToastNativeSurfaceBoundary>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.surfaceHeaderRow}>
                <Text style={styles.surfaceTitle}>Payment Modal</Text>
                <View style={styles.surfaceBadge}>
                  <Text style={styles.surfaceBadgeText}>Preview</Text>
                </View>
              </View>
              <View style={styles.surfaceDivider} />
              <View style={styles.skeletonLineLong} />
              <View style={styles.skeletonLineMedium} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.surfaceRow}>
                <View style={styles.skeletonPill} />
                <View style={styles.skeletonPill} />
                <View style={styles.skeletonPillNarrow} />
              </View>
              <View style={styles.surfaceRow}>
                <View style={styles.skeletonButtonGhost} />
                <View style={styles.skeletonButtonPrimary} />
              </View>
              <View style={styles.surfaceDivider} />
              <View style={styles.surfaceRow}>
                <View style={styles.skeletonStatCard} />
                <View style={styles.skeletonStatCard} />
              </View>
              <View style={styles.surfaceDivider} />
              <ToastViewport
                hostId="capture-modal"
                interactionMode="classic"
                config={hostConfig}
              />
            </View>
          </View>
        </ToastNativeSurfaceBoundary>
      </Modal>

      {sheetVisible ? (
        <View pointerEvents="none" style={styles.sheetContainer}>
          <View style={styles.sheetBackdrop} />
          <View style={styles.sheetCard}>
            <View style={styles.surfaceHandle} />
            <View style={styles.surfaceHeaderRow}>
              <Text style={styles.surfaceTitle}>Coupon Sheet</Text>
              <View style={styles.surfaceBadge}>
                <Text style={styles.surfaceBadgeText}>Preview</Text>
              </View>
            </View>
            <View style={styles.surfaceDivider} />
            <View style={styles.skeletonLineLong} />
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.surfaceRow}>
              <View style={styles.skeletonPill} />
              <View style={styles.skeletonPill} />
              <View style={styles.skeletonPillNarrow} />
            </View>
            <View style={styles.surfaceRow}>
              <View style={styles.skeletonButtonGhost} />
              <View style={styles.skeletonButtonPrimary} />
            </View>
            <View style={styles.surfaceDivider} />
            <View style={styles.surfaceRow}>
              <View style={styles.skeletonStatCard} />
              <View style={styles.skeletonStatCard} />
            </View>
            <View style={styles.surfaceDivider} />
            <ToastViewport
              hostId="capture-sheet"
              interactionMode="classic"
              config={hostConfig}
            />
          </View>
        </View>
      ) : null}

      {markerColor ? (
        <View style={[styles.marker, { backgroundColor: markerColor }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
  },
  overlayCard: {
    backgroundColor: "#111a33",
    borderColor: "#1e2c50",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  segmentLabel: {
    color: "#9fb7ff",
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  doneLabel: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
  keyboardProbe: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
  },
  keyboardInput: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    color: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    minHeight: 250,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#111827",
    padding: 14,
    gap: 10,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.55)",
  },
  sheetCard: {
    minHeight: 320,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "#0f172a",
    padding: 14,
    gap: 10,
    justifyContent: "flex-end",
  },
  surfaceHandle: {
    alignSelf: "center",
    width: 54,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#64748b",
    opacity: 0.9,
    marginBottom: 2,
  },
  surfaceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  surfaceBadge: {
    backgroundColor: "#172554",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  surfaceBadgeText: {
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: "700",
  },
  surfaceTitle: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
  },
  surfaceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#334155",
    opacity: 0.9,
  },
  skeletonLineLong: {
    height: 10,
    width: "88%",
    borderRadius: 8,
    backgroundColor: "#334155",
  },
  skeletonLineMedium: {
    height: 10,
    width: "68%",
    borderRadius: 8,
    backgroundColor: "#3b4a61",
  },
  skeletonLineShort: {
    height: 9,
    width: "52%",
    borderRadius: 8,
    backgroundColor: "#2f3d53",
  },
  surfaceRow: {
    flexDirection: "row",
    gap: 8,
  },
  skeletonPill: {
    height: 26,
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#263247",
  },
  skeletonPillNarrow: {
    height: 26,
    width: 56,
    borderRadius: 999,
    backgroundColor: "#334155",
  },
  skeletonButtonGhost: {
    height: 34,
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "rgba(51,65,85,0.15)",
  },
  skeletonButtonPrimary: {
    height: 34,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#1d4ed8",
    opacity: 0.85,
  },
  skeletonStatCard: {
    height: 56,
    flex: 1,
    borderRadius: 12,
    backgroundColor: "rgba(51,65,85,0.42)",
    borderWidth: 1,
    borderColor: "#3a4a60",
  },
  marker: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});
