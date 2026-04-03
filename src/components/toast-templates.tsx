import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ToastDismissIconButton, ToastVariantIcon } from "./toast-icons";
import type {
  ToastAction,
  ToastRecord,
  ToastRenderContext,
  ToastTemplate,
  ToastTemplateProps,
  ToastTemplateRegistry,
  ToastTemplateRenderer,
} from "../types/internal";
import {
  resolveDismissible,
  resolveShowDismissButton,
  resolveTemplate,
} from "../utils/toast-utils";

type VariantPalette = {
  background: string;
  border: string;
  title: string;
  description: string;
  actionBackground: string;
  actionForeground: string;
  iconBackground: string;
  iconForeground: string;
};

const TOAST_THEME_TOKENS = {
  light: {
    surface: "#FFFFFF",
    surfaceMuted: "#F8FAFC",
    border: "#E2E8F0",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    accent: "#2563EB",
    accentSoft: "#DBEAFE",
    success: "#16A34A",
    successSoft: "#DCFCE7",
    warning: "#D97706",
    warningSoft: "#FEF3C7",
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
  },
  dark: {
    surface: "#0F172A",
    surfaceMuted: "#1E293B",
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    accent: "#60A5FA",
    accentSoft: "#1E3A8A",
    success: "#4ADE80",
    successSoft: "#14532D",
    warning: "#F59E0B",
    warningSoft: "#78350F",
    danger: "#F87171",
    dangerSoft: "#7F1D1D",
  },
} as const;

type ToastThemeTokens = {
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
};

function createVariantPalette(
  variant: ToastRecord["variant"],
  tokens: ToastThemeTokens,
): VariantPalette {
  switch (variant) {
    case "success":
      return {
        background: tokens.surface,
        border: tokens.success,
        title: tokens.success,
        description: tokens.textSecondary,
        actionBackground: tokens.successSoft,
        actionForeground: tokens.success,
        iconBackground: tokens.successSoft,
        iconForeground: tokens.success,
      };
    case "error":
      return {
        background: tokens.surface,
        border: tokens.danger,
        title: tokens.danger,
        description: tokens.textSecondary,
        actionBackground: tokens.dangerSoft,
        actionForeground: tokens.danger,
        iconBackground: tokens.dangerSoft,
        iconForeground: tokens.danger,
      };
    case "warning":
      return {
        background: tokens.surface,
        border: tokens.warning,
        title: tokens.warning,
        description: tokens.textSecondary,
        actionBackground: tokens.warningSoft,
        actionForeground: tokens.warning,
        iconBackground: tokens.warningSoft,
        iconForeground: tokens.warning,
      };
    case "info":
      return {
        background: tokens.surface,
        border: tokens.accent,
        title: tokens.accent,
        description: tokens.textSecondary,
        actionBackground: tokens.accentSoft,
        actionForeground: tokens.accent,
        iconBackground: tokens.accentSoft,
        iconForeground: tokens.accent,
      };
    case "loading":
      return {
        background: tokens.surface,
        border: tokens.accent,
        title: tokens.textPrimary,
        description: tokens.textSecondary,
        actionBackground: tokens.surfaceMuted,
        actionForeground: tokens.textPrimary,
        iconBackground: tokens.accentSoft,
        iconForeground: tokens.accent,
      };
    case "default":
    default:
      return {
        background: tokens.surface,
        border: tokens.border,
        title: tokens.textPrimary,
        description: tokens.textSecondary,
        actionBackground: tokens.surfaceMuted,
        actionForeground: tokens.textPrimary,
        iconBackground: tokens.surfaceMuted,
        iconForeground: tokens.textPrimary,
      };
  }
}

function createToastA11yLabel(toast: ToastRecord): string {
  const statusPrefix =
    toast.variant === "loading"
      ? "Loading."
      : toast.variant === "error"
        ? "Error."
        : toast.variant === "success"
          ? "Success."
          : toast.variant === "warning"
            ? "Warning."
            : toast.variant === "info"
              ? "Info."
              : "Notification.";

  const content = [toast.title, toast.description]
    .filter(Boolean)
    .join(". ")
    .trim();
  return toast.accessibilityLabel ?? `${statusPrefix} ${content}`.trim();
}

function useVariantPalette(
  variant: ToastRecord["variant"],
  resolvedTheme: ToastRenderContext["resolvedTheme"],
): VariantPalette {
  return useMemo(() => {
    return createVariantPalette(variant, TOAST_THEME_TOKENS[resolvedTheme]);
  }, [resolvedTheme, variant]);
}

function DefaultToastIcon({
  variant,
  palette,
}: {
  variant: ToastRecord["variant"];
  palette: VariantPalette;
}) {
  return (
    <ToastVariantIcon
      variant={variant}
      color={palette.iconForeground}
      size={16}
    />
  );
}

function ToastActions({
  actions,
  palette,
  context,
  compact,
}: {
  actions: ToastAction[];
  palette: VariantPalette;
  context: ToastRenderContext;
  compact?: boolean;
}) {
  if (!actions.length) {
    return null;
  }

  const actionRowStyle = compact ? styles.actionsRowCompact : styles.actionsRow;
  const actionButtonStyle = compact
    ? styles.actionButtonCompact
    : styles.actionButton;
  const actionTextStyle = compact
    ? styles.actionTextCompact
    : styles.actionText;

  return (
    <View style={actionRowStyle}>
      {actions.map((action, actionIndex) => {
        return (
          <Pressable
            key={action.id ?? `${context.toast.id}-action-${actionIndex}`}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            className={action.className}
            style={[
              actionButtonStyle,
              { backgroundColor: palette.actionBackground },
              action.style,
            ]}
            onPressIn={context.onPressIn}
            onPressOut={context.onPressOut}
            onPress={() => context.onActionPress(action, actionIndex)}
          >
            <Text
              className={action.textClassName}
              style={[
                actionTextStyle,
                { color: palette.actionForeground },
                action.textStyle,
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CompactToastTemplate({
  toast,
  hostConfig,
  context,
}: ToastTemplateProps) {
  const palette = useVariantPalette(toast.variant, context.resolvedTheme);
  const dismissible = resolveDismissible(toast, hostConfig);
  const showDismissButton = resolveShowDismissButton(toast, hostConfig);
  const compactIconSideStyle = styles.compactIconSide;
  const compactDismissSideStyle = styles.compactDismissButtonSide;

  return (
    <Pressable
      accessibilityRole="alert"
      accessibilityLabel={createToastA11yLabel(toast)}
      accessibilityHint={
        toast.variant === "loading"
          ? "In progress status notification"
          : undefined
      }
      accessibilityLiveRegion="polite"
      onPress={context.onPress}
      onPressIn={context.onPressIn}
      onPressOut={context.onPressOut}
      className={toast.className}
      style={[
        styles.compactRoot,
        {
          borderColor: palette.border,
          backgroundColor: palette.background,
          flexDirection: "row",
        },
        toast.style,
      ]}
    >
      <View
        style={[
          styles.compactIconBase,
          compactIconSideStyle,
          { backgroundColor: palette.iconBackground },
        ]}
      >
        {toast.icon ?? (
          <DefaultToastIcon variant={toast.variant} palette={palette} />
        )}
      </View>

      <View
        className={toast.contentClassName}
        style={[
          styles.contentFlex,
          toast.contentStyle,
        ]}
      >
        {toast.title ? (
          <Text
            className={toast.titleClassName}
            style={[
              styles.compactTitle,
              { color: palette.title },
              toast.titleStyle,
            ]}
          >
            {toast.title}
          </Text>
        ) : null}

        {toast.description ? (
          <Text
            className={toast.descriptionClassName}
            style={[
              styles.compactDescription,
              { color: palette.description },
              toast.descriptionStyle,
            ]}
          >
            {toast.description}
          </Text>
        ) : null}
      </View>

      <ToastActions
        actions={toast.actions ?? []}
        palette={palette}
        context={context}
        compact
      />

      {dismissible && showDismissButton ? (
        <ToastDismissIconButton
          accessibilityLabel={
            toast.title ? `Dismiss ${toast.title}` : "Dismiss notification"
          }
          accessibilityHint="Closes this notification"
          onPressIn={context.onPressIn}
          onPressOut={context.onPressOut}
          onPress={() => context.dismiss("dismiss")}
          iconColor={palette.description}
          iconSize={16}
          style={[styles.compactDismissButtonBase, compactDismissSideStyle]}
        />
      ) : null}
    </Pressable>
  );
}

export function BannerToastTemplate({
  toast,
  hostConfig,
  context,
}: ToastTemplateProps) {
  const palette = useVariantPalette(toast.variant, context.resolvedTheme);
  const dismissible = resolveDismissible(toast, hostConfig);
  const showDismissButton = resolveShowDismissButton(toast, hostConfig);
  const hasCloseButton = dismissible && showDismissButton;
  const bannerContentPaddingStyle = hasCloseButton
    ? styles.bannerContentWithClose
    : styles.bannerContent;

  return (
    <Pressable
      accessibilityRole="alert"
      accessibilityLabel={createToastA11yLabel(toast)}
      accessibilityHint={
        toast.variant === "loading"
          ? "In progress status notification"
          : undefined
      }
      accessibilityLiveRegion="polite"
      onPress={context.onPress}
      onPressIn={context.onPressIn}
      onPressOut={context.onPressOut}
      className={toast.className}
      style={[
        styles.bannerRoot,
        {
          borderColor: palette.border,
          backgroundColor: palette.background,
        },
        toast.style,
      ]}
    >
      <View
        style={[
          styles.bannerIndicatorBase,
          { backgroundColor: palette.border },
        ]}
      />

      <View
        className={toast.contentClassName}
        style={[
          styles.bannerContentBase,
          bannerContentPaddingStyle,
          toast.contentStyle,
        ]}
      >
        <View style={styles.bannerRow}>
          <View
            style={[
              styles.bannerIconBase,
              styles.bannerIconSide,
              { backgroundColor: palette.iconBackground },
            ]}
          >
            {toast.icon ?? (
              <DefaultToastIcon variant={toast.variant} palette={palette} />
            )}
          </View>

          <View
            style={[
              styles.contentFlex,
            ]}
          >
            {toast.title ? (
              <Text
                className={toast.titleClassName}
                style={[
                  styles.bannerTitle,
                  { color: palette.title },
                  toast.titleStyle,
                ]}
              >
                {toast.title}
              </Text>
            ) : null}

            {toast.description ? (
              <Text
                className={toast.descriptionClassName}
                style={[
                  styles.bannerDescription,
                  { color: palette.description },
                  toast.descriptionStyle,
                ]}
              >
                {toast.description}
              </Text>
            ) : null}
          </View>
        </View>

        <ToastActions
          actions={toast.actions ?? []}
          palette={palette}
          context={context}
        />
      </View>

      {hasCloseButton ? (
        <ToastDismissIconButton
          accessibilityLabel={
            toast.title ? `Dismiss ${toast.title}` : "Dismiss notification"
          }
          accessibilityHint="Closes this notification"
          onPressIn={context.onPressIn}
          onPressOut={context.onPressOut}
          onPress={() => context.dismiss("dismiss")}
          iconColor={palette.description}
          iconSize={18}
          style={styles.bannerDismissBase}
        />
      ) : null}
    </Pressable>
  );
}

export const BUILT_IN_TOAST_TEMPLATES: Record<
  ToastTemplate,
  ToastTemplateRenderer
> = {
  compact: CompactToastTemplate,
  banner: BannerToastTemplate,
};

const styles = StyleSheet.create({
  contentFlex: { flex: 1 },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  actionsRowCompact: {
    marginStart: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionButtonCompact: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: { fontWeight: "600", fontSize: 13 },
  actionTextCompact: { fontWeight: "600", fontSize: 12 },
  compactRoot: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  compactIconBase: {
    width: 24,
    height: 24,
    borderRadius: 999,
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  compactIconSide: { marginEnd: 10, marginStart: 0 },
  compactTitle: { fontWeight: "700", fontSize: 14, lineHeight: 19 },
  compactDescription: { marginTop: 2, fontSize: 12, lineHeight: 18 },
  compactDismissButtonBase: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  compactDismissButtonSide: { marginStart: 8, marginEnd: 0 },
  bannerRoot: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: "hidden",
  },
  bannerIndicatorBase: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 5,
    start: 0,
  },
  bannerContentBase: { paddingTop: 2 },
  bannerContent: { paddingStart: 4, paddingEnd: 8 },
  bannerContentWithClose: { paddingStart: 4, paddingEnd: 34 },
  bannerRow: { flexDirection: "row", alignItems: "flex-start" },
  bannerIconBase: {
    width: 24,
    height: 24,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  bannerIconSide: { marginEnd: 10, marginStart: 0 },
  bannerTitle: { fontWeight: "700", fontSize: 15, lineHeight: 21 },
  bannerDescription: { marginTop: 3, fontSize: 13, lineHeight: 19 },
  bannerDismissBase: {
    position: "absolute",
    top: 8,
    end: 8,
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});

const DEFAULT_TEMPLATE: ToastTemplate = "compact";

export function createToastTemplateRegistry(
  templates?: ToastTemplateRegistry,
): ToastTemplateRegistry {
  return { ...BUILT_IN_TOAST_TEMPLATES, ...templates };
}

function resolveToastTemplateRenderer(
  templateName: string | undefined,
  templates?: ToastTemplateRegistry,
): ToastTemplateRenderer {
  if (templateName && templates?.[templateName]) {
    return templates[templateName];
  }

  if (templateName && templateName in BUILT_IN_TOAST_TEMPLATES) {
    return BUILT_IN_TOAST_TEMPLATES[templateName as ToastTemplate];
  }

  return BUILT_IN_TOAST_TEMPLATES[DEFAULT_TEMPLATE];
}

export function renderToastTemplate(
  props: ToastTemplateProps & { templates?: ToastTemplateRegistry },
) {
  const { templates, ...templateProps } = props;

  if (templateProps.toast.render) {
    return templateProps.toast.render(templateProps.context);
  }

  const templateName = resolveTemplate(
    templateProps.toast,
    templateProps.hostConfig,
  );
  const renderer = resolveToastTemplateRenderer(templateName, templates);
  return renderer(templateProps);
}
