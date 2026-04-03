import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import type { ToastVariant } from "../types";

type ToastLocalIconName =
  | "information-circle-outline"
  | "checkmark-circle"
  | "close-circle"
  | "warning"
  | "information-circle";

const VARIANT_ICON_NAMES: Record<Exclude<ToastVariant, "loading">, ToastLocalIconName> = {
  default: "information-circle-outline",
  success: "checkmark-circle",
  error: "close-circle",
  warning: "warning",
  info: "information-circle",
};

function resolveVariant(variant?: ToastVariant): ToastVariant {
  return variant ?? "default";
}

export function getToastVariantIconName(variant?: ToastVariant): ToastLocalIconName | null {
  const resolvedVariant = resolveVariant(variant);
  if (resolvedVariant === "loading") {
    return null;
  }
  return VARIANT_ICON_NAMES[resolvedVariant];
}

function SvgIconFrame({
  className,
  size,
  children,
}: {
  className?: string;
  size: number;
  children: ReactNode;
}) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={className}
      pointerEvents="none"
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      {children}
    </View>
  );
}

function InfoOutlineIcon({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="8.3" r="1.05" fill={color} />
      <Line x1="12" y1="11.5" x2="12" y2="16.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function InfoFilledIcon({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Circle cx="12" cy="8.2" r="1.1" fill="#FFFFFF" />
      <Line x1="12" y1="11.4" x2="12" y2="16.2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CheckCircleIcon({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M7.8 12.5L10.7 15.4L16.2 9.9"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CloseCircleIcon({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Line x1="8.6" y1="8.6" x2="15.4" y2="15.4" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" />
      <Line x1="15.4" y1="8.6" x2="8.6" y2="15.4" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" />
    </Svg>
  );
}

function WarningIcon({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.8L21 19.2H3L12 3.8Z" fill={color} />
      <Line x1="12" y1="9.1" x2="12" y2="13.8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="16.7" r="1.05" fill="#FFFFFF" />
    </Svg>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Line x1="6.8" y1="6.8" x2="17.2" y2="17.2" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
      <Line x1="17.2" y1="6.8" x2="6.8" y2="17.2" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    </Svg>
  );
}

function renderVariantIcon(iconName: ToastLocalIconName, color: string) {
  switch (iconName) {
    case "checkmark-circle":
      return <CheckCircleIcon color={color} />;
    case "close-circle":
      return <CloseCircleIcon color={color} />;
    case "warning":
      return <WarningIcon color={color} />;
    case "information-circle":
      return <InfoFilledIcon color={color} />;
    case "information-circle-outline":
    default:
      return <InfoOutlineIcon color={color} />;
  }
}

export function ToastVariantIcon({
  variant,
  color,
  size = 16,
  className,
}: {
  variant?: ToastVariant;
  color: string;
  size?: number;
  className?: string;
}) {
  const resolvedVariant = resolveVariant(variant);
  if (resolvedVariant === "loading") {
    return <ActivityIndicator size="small" color={color} />;
  }

  const iconName = getToastVariantIconName(resolvedVariant);
  if (!iconName) {
    return null;
  }

  return (
    <SvgIconFrame className={className} size={size}>
      {renderVariantIcon(iconName, color)}
    </SvgIconFrame>
  );
}

export function ToastDismissIconButton({
  accessibilityLabel,
  accessibilityHint,
  onPress,
  onPressIn,
  onPressOut,
  iconColor,
  iconSize = 18,
  className,
  style,
}: {
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  iconColor: string;
  iconSize?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      className={className}
      style={style}
    >
      <SvgIconFrame size={iconSize}>
        <CloseIcon color={iconColor} />
      </SvgIconFrame>
    </Pressable>
  );
}

