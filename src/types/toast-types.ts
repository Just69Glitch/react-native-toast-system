import type { ReactNode, Ref } from "react";
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from "react-native";

export type ToastId = string;

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "loading";

export type ToastTemplate = "compact" | "banner";

export type ToastPosition = "top" | "bottom";

export type ToastAnimationPreset = "subtle" | "spring" | "snappy";

export type ToastDedupeMode = "reset" | "replace" | "ignore" | "bump";
export type ToastGroupBehavior = "replace-in-group" | "update-in-group" | "stack-in-group";
export type ToastPriorityMode = "soft" | "strict";
export type ToastHostPreset = "default" | "minimal" | "status" | "banner-heavy";

export type CloseReason = "timeout" | "swipe" | "press" | "action" | "dismiss" | "programmatic";

export type ToastLayering = "newer-on-top" | "older-on-top";
export type ToastStackOverflowMode = "fade" | "compact" | "clip";
export type ToastInteractionMode = "classic" | "deck";
export type ToastTheme = "auto" | "light" | "dark";
export type ToastDirection = "auto" | "ltr" | "rtl";
export type ToastResolvedTheme = "light" | "dark";
export type ToastDismissAllConfirmationKind = "none" | "default" | "custom";
export type ToastExpandedAutoCollapsePolicy = number | false;
export type ToastDismissAllConfirmation =
  | "none"
  | "default"
  | ((context: ToastDismissAllAttemptContext) => Promise<boolean> | boolean);

export interface ToastStackStateContext {
  hostId: string;
  position: ToastPosition;
  visibleCount: number;
  expanded: boolean;
}

export interface ToastDismissAllAttemptContext extends ToastStackStateContext {
  confirmation: ToastDismissAllConfirmationKind;
}

export interface ToastDismissAllCompleteContext extends ToastStackStateContext {
  confirmation: ToastDismissAllConfirmationKind;
  confirmed: boolean;
  dismissed: boolean;
}

export interface ToastHostConfigChangeContext {
  hostId: string;
  previousConfig: ResolvedToastHostConfig;
  nextConfig: ResolvedToastHostConfig;
  changedKeys: string[];
  dismissedCount: number;
}

export interface ToastAnimationConfig {
  preset?: ToastAnimationPreset;
  duration?: number;
}

export interface ToastGestureConfig {
  enabled?: boolean;
  dismissThreshold?: number;
  cancelThreshold?: number;
  velocityThreshold?: number;
}

export type ResolvedToastGestureConfig = Required<ToastGestureConfig>;

export interface ToastClassicGestureConfig extends ToastGestureConfig {
  itemDismiss?: ToastGestureConfig;
}

export interface ToastDeckGestureConfig extends ToastGestureConfig {
  itemDismiss?: ToastGestureConfig;
  collapsedExpand?: ToastGestureConfig;
  collapsedDismissAll?: ToastGestureConfig;
  collapseHandle?: ToastGestureConfig;
}

export interface ResolvedToastClassicGestureConfig extends ResolvedToastGestureConfig {
  itemDismiss: ResolvedToastGestureConfig;
}

export interface ResolvedToastDeckGestureConfig extends ResolvedToastGestureConfig {
  itemDismiss: ResolvedToastGestureConfig;
  collapsedExpand: ResolvedToastGestureConfig;
  collapsedDismissAll: ResolvedToastGestureConfig;
  collapseHandle: ResolvedToastGestureConfig;
}

export interface ToastCollapseHandleStyle {
  width?: number;
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  opacity?: number;
  marginTop?: number;
  marginBottom?: number;
}

export type ResolvedToastCollapseHandleStyle = Omit<
  Required<ToastCollapseHandleStyle>,
  "backgroundColor"
> &
  Pick<ToastCollapseHandleStyle, "backgroundColor">;

export interface ToastActionContext {
  id: ToastId;
  hostId: string;
  action: ToastAction;
  actionIndex: number;
  dismiss: (reason?: CloseReason) => boolean;
  update: (options: ToastUpdateOptions) => boolean;
}

export interface ToastLifecycleState {
  mounted: boolean;
  visible: boolean;
  isClosing: boolean;
}

export interface ToastCallbackContext {
  id: ToastId;
  hostId: string;
  reason?: CloseReason;
  state: ToastLifecycleState;
  toast: ToastRecord;
}

export interface ToastAction {
  id?: string;
  label: string;
  accessibilityLabel?: string;
  onPress?: (context: ToastActionContext) => void | Promise<void>;
  dismissOnPress?: boolean;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface ToastRenderContext {
  toast: ToastRecord;
  resolvedTheme: ToastResolvedTheme;
  dismiss: (reason?: CloseReason) => boolean;
  update: (options: ToastUpdateOptions) => boolean;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onActionPress: (action: ToastAction, actionIndex: number) => void;
}

export interface ToastTemplateProps {
  toast: ToastRecord;
  hostConfig: ResolvedToastHostConfig;
  context: ToastRenderContext;
}

export type ToastTemplateRenderer = (props: ToastTemplateProps) => ReactNode;
export type ToastTemplateRegistry = Record<string, ToastTemplateRenderer>;

export interface ToastOptions {
  id?: ToastId;
  hostId?: string;
  dedupeKey?: string;
  dedupeMode?: ToastDedupeMode;
  groupId?: string;
  groupBehavior?: ToastGroupBehavior;
  priority?: number;

  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ToastAction[];
  template?: ToastTemplate;
  render?: (context: ToastRenderContext) => ReactNode;

  variant?: ToastVariant;
  duration?: number | "persistent";
  persistent?: boolean;
  dismissible?: boolean;
  dismissOnPress?: boolean;
  showDismissButton?: boolean;

  position?: ToastPosition;
  direction?: ToastDirection;
  keyboardAvoidance?: boolean;
  keyboardOffset?: number;
  pauseOnDrag?: boolean;
  pauseOnPress?: boolean;

  animationPreset?: ToastAnimationPreset;
  animationDuration?: number;
  animation?: ToastAnimationConfig;
  gesture?: ToastGestureConfig;

  zIndex?: number;

  className?: string;
  style?: StyleProp<ViewStyle>;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
  titleClassName?: string;
  titleStyle?: StyleProp<TextStyle>;
  descriptionClassName?: string;
  descriptionStyle?: StyleProp<TextStyle>;

  accessibilityLabel?: string;

  onMount?: (context: ToastCallbackContext) => void;
  onOpen?: (context: ToastCallbackContext) => void;
  onUpdate?: (context: ToastCallbackContext) => void;
  onClose?: (context: ToastCallbackContext) => void;
  onDismiss?: (context: ToastCallbackContext) => void;
  onPress?: (context: ToastCallbackContext) => void;
  onActionPress?: (context: ToastActionContext) => void;
  onClosingStart?: (context: ToastCallbackContext) => void;
  onClosingEnd?: (context: ToastCallbackContext) => void;
}

export interface ToastUpdateOptions extends Partial<Omit<ToastOptions, "id" | "hostId">> {
  reason?: CloseReason;
}

interface CommonToastHostConfigBase {
  preset?: ToastHostPreset;
  debug?: boolean;
  theme?: ToastTheme;
  direction?: ToastDirection;
  onConfigChange?: (context: ToastHostConfigChangeContext) => void;

  duration?: number | "persistent";
  variantDurations?: Partial<Record<ToastVariant, number | "persistent">>;

  position?: ToastPosition;
  maxStackSize?: number;
  stackGap?: number;
  stackOverlap?: number;
  deEmphasize?: boolean;
  deEmphasizeScaleStep?: number;
  deEmphasizeOpacityStep?: number;

  dedupeMode?: ToastDedupeMode;
  groupBehavior?: ToastGroupBehavior;
  priorityMode?: ToastPriorityMode;
  priorityWeight?: number;
  dismissible?: boolean;
  showDismissButton?: boolean;

  animationPreset?: ToastAnimationPreset;
  animationDuration?: number;

  keyboardAvoidance?: boolean;
  keyboardOffset?: number;
  pauseOnDrag?: boolean;
  pauseOnPress?: boolean;

  zIndexBase?: number;
  zIndexStep?: number;
  layering?: ToastLayering;

  defaultTemplate?: ToastTemplate;

  useRNScreensOverlay?: boolean;
  rnScreensOverlayViewStyle?: StyleProp<ViewStyle>;

  className?: string;
  style?: StyleProp<ViewStyle>;
}

interface ClassicToastHostConfigFields {
  classicMaxVisible?: number;
  classicOverflowMode?: ToastStackOverflowMode;
  classicOverflowBuffer?: number;
  classicGesture?: ToastClassicGestureConfig;
}

interface DeckToastHostConfigFields {
  deckCollapsedMaxVisible?: number;
  deckExpandedMaxVisible?: number;
  deckGesture?: ToastDeckGestureConfig;
  allowCollapsedFrontHorizontalDismiss?: boolean;
  disableSwipeDismissAll?: boolean;
  collapseHandleStyle?: ToastCollapseHandleStyle;
  dismissAllConfirmation?: ToastDismissAllConfirmation;
  dismissAllConfirmationTitle?: string;
  dismissAllConfirmationMessage?: string;
  dismissAllConfirmLabel?: string;
  dismissAllCancelLabel?: string;

  expandedMaxHeight?: number;
  expandedAutoCollapse?: ToastExpandedAutoCollapsePolicy;

  onStackExpand?: (context: ToastStackStateContext) => void;
  onStackCollapse?: (context: ToastStackStateContext) => void;
  onStackStateChange?: (context: ToastStackStateContext) => void;
  onDismissAllAttempt?: (context: ToastDismissAllAttemptContext) => void;
  onDismissAllComplete?: (context: ToastDismissAllCompleteContext) => void;
}

export interface ClassicToastHostConfig
  extends CommonToastHostConfigBase, ClassicToastHostConfigFields {
  deckCollapsedMaxVisible?: never;
  deckExpandedMaxVisible?: never;
  deckGesture?: never;
  allowCollapsedFrontHorizontalDismiss?: never;
  disableSwipeDismissAll?: never;
  collapseHandleStyle?: never;
  dismissAllConfirmation?: never;
  dismissAllConfirmationTitle?: never;
  dismissAllConfirmationMessage?: never;
  dismissAllConfirmLabel?: never;
  dismissAllCancelLabel?: never;
  expandedMaxHeight?: never;
  expandedAutoCollapse?: never;
  onStackExpand?: never;
  onStackCollapse?: never;
  onStackStateChange?: never;
  onDismissAllAttempt?: never;
  onDismissAllComplete?: never;
}

export interface DeckToastHostConfig extends CommonToastHostConfigBase, DeckToastHostConfigFields {
  classicMaxVisible?: never;
  classicOverflowMode?: never;
  classicOverflowBuffer?: never;
  classicGesture?: never;
}

export type ToastHostConfig = ClassicToastHostConfig | DeckToastHostConfig;

interface CommonResolvedToastHostConfigBase {
  preset: ToastHostPreset;
  debug: boolean;
  theme: ToastTheme;
  direction: ToastDirection;
  onConfigChange?: (context: ToastHostConfigChangeContext) => void;

  duration: number | "persistent";
  variantDurations: Partial<Record<ToastVariant, number | "persistent">>;

  position: ToastPosition;
  classicMaxVisible: number;
  maxStackSize: number;
  stackGap: number;
  deEmphasize: boolean;
  deEmphasizeScaleStep: number;
  deEmphasizeOpacityStep: number;

  dedupeMode: ToastDedupeMode;
  groupBehavior: ToastGroupBehavior;
  priorityMode: ToastPriorityMode;
  priorityWeight: number;
  dismissible: boolean;
  showDismissButton: boolean;

  animationPreset: ToastAnimationPreset;
  animationDuration: number;

  keyboardAvoidance: boolean;
  keyboardOffset: number;
  pauseOnDrag: boolean;
  pauseOnPress: boolean;

  interactionMode: ToastInteractionMode;

  classicOverflowMode: ToastStackOverflowMode;
  classicOverflowBuffer: number;
  stackOverlap: number;

  zIndexBase: number;
  zIndexStep: number;
  layering: ToastLayering;

  defaultTemplate: ToastTemplate;

  useRNScreensOverlay: boolean;
  rnScreensOverlayViewStyle?: StyleProp<ViewStyle>;

  className?: string;
  style?: StyleProp<ViewStyle>;
}

interface DeckResolvedToastHostConfigFields {
  deckCollapsedMaxVisible: number;
  deckExpandedMaxVisible: number;
  deckGesture: ResolvedToastDeckGestureConfig;
  allowCollapsedFrontHorizontalDismiss: boolean;
  disableSwipeDismissAll: boolean;
  collapseHandleStyle: ResolvedToastCollapseHandleStyle;
  dismissAllConfirmation: ToastDismissAllConfirmation;
  dismissAllConfirmationTitle: string;
  dismissAllConfirmationMessage: string;
  dismissAllConfirmLabel: string;
  dismissAllCancelLabel: string;

  expandedMaxHeight: number;
  expandedAutoCollapse: ToastExpandedAutoCollapsePolicy;

  onStackExpand?: (context: ToastStackStateContext) => void;
  onStackCollapse?: (context: ToastStackStateContext) => void;
  onStackStateChange?: (context: ToastStackStateContext) => void;
  onDismissAllAttempt?: (context: ToastDismissAllAttemptContext) => void;
  onDismissAllComplete?: (context: ToastDismissAllCompleteContext) => void;
}

export interface ResolvedClassicToastHostConfig extends CommonResolvedToastHostConfigBase {
  interactionMode: "classic";
  classicGesture: ResolvedToastClassicGestureConfig;
  deckCollapsedMaxVisible?: never;
  deckExpandedMaxVisible?: never;
  deckGesture?: never;
  allowCollapsedFrontHorizontalDismiss?: never;
  disableSwipeDismissAll?: never;
  collapseHandleStyle?: never;
  dismissAllConfirmation?: never;
  dismissAllConfirmationTitle?: never;
  dismissAllConfirmationMessage?: never;
  dismissAllConfirmLabel?: never;
  dismissAllCancelLabel?: never;
  expandedMaxHeight?: never;
  expandedAutoCollapse?: never;
  onStackExpand?: never;
  onStackCollapse?: never;
  onStackStateChange?: never;
  onDismissAllAttempt?: never;
  onDismissAllComplete?: never;
}

export interface ResolvedDeckToastHostConfig
  extends CommonResolvedToastHostConfigBase, DeckResolvedToastHostConfigFields {
  interactionMode: "deck";
  classicGesture?: never;
}

export type ResolvedToastHostConfig = ResolvedClassicToastHostConfig | ResolvedDeckToastHostConfig;

export interface ToastRecord extends Omit<ToastOptions, "id" | "hostId"> {
  id: ToastId;
  hostId: string;
  createdAt: number;
  updatedAt: number;
  order: number;
  closeReason?: CloseReason;
  lifecycle: ToastLifecycleState;
}

export interface ToastHostState {
  id: string;
  config: ResolvedToastHostConfig;
  toasts: ToastRecord[];
}

export interface ToastStateSnapshot {
  version: number;
  hosts: Record<string, ToastHostState>;
}

export interface ToastController {
  readonly hostId: string;
  show: (options: string | ToastOptions) => ToastId;
  success: (options: string | ToastOptions) => ToastId;
  error: (options: string | ToastOptions) => ToastId;
  warning: (options: string | ToastOptions) => ToastId;
  info: (options: string | ToastOptions) => ToastId;
  loading: (options: string | ToastOptions) => ToastId;
  promise: <T>(
    promise: Promise<T>,
    options: ToastPromiseOptions<T>,
    commonOptions?: Partial<ToastOptions>,
  ) => Promise<T>;
  update: (id: ToastId, options: ToastUpdateOptions) => boolean;
  dismiss: (id: ToastId, reason?: CloseReason) => boolean;
  dismissAll: (reason?: CloseReason) => void;
  dismissGroup: (groupId: string, reason?: CloseReason) => number;
  updateGroup: (groupId: string, options: ToastUpdateOptions) => number;
  isVisible: (id: ToastId) => boolean;
}

export interface ToastProviderProps {
  children?: ReactNode;
  defaultHostId?: string;
  defaultHostConfig?: ToastHostConfig;
  templates?: ToastTemplateRegistry;
  debug?: boolean;
  useRNScreensOverlay?: boolean;
  rnScreensOverlayViewStyle?: StyleProp<ViewStyle>;
}

interface ToastHostPropsBase {
  hostId?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  controllerRef?: Ref<ToastController | null>;
  useRNScreensOverlay?: boolean;
  rnScreensOverlayViewStyle?: StyleProp<ViewStyle>;
}

export interface ClassicToastHostProps extends ToastHostPropsBase {
  interactionMode: "classic";
  config?: ClassicToastHostConfig;
}

export interface DeckToastHostProps extends ToastHostPropsBase {
  interactionMode?: "deck";
  config?: DeckToastHostConfig;
}

export type ToastHostProps = ClassicToastHostProps | DeckToastHostProps;

export type ToastViewportProps = ToastHostProps;

export interface ToastNativeSurfaceBoundaryProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  unstable_forceActive?: boolean;
}

export interface ToastPromiseOptions<T> {
  loading: string | ToastOptions;
  success?: string | ToastOptions | ((value: T) => string | ToastOptions);
  error?: string | ToastOptions | ((error: unknown) => string | ToastOptions);
  finally?: ToastUpdateOptions;
  hostId?: string;
  groupId?: string;
  groupBehavior?: ToastGroupBehavior;
  priority?: number;
}

export interface ToastStoreBridge {
  createController: (hostId?: string) => ToastController;
  show: (options: string | ToastOptions, hostId?: string) => ToastId;
  update: (id: ToastId, options: ToastUpdateOptions, hostId?: string) => boolean;
  dismiss: (id: ToastId, reason?: CloseReason, hostId?: string) => boolean;
  dismissAll: (hostId?: string, reason?: CloseReason) => void;
  dismissGroup: (groupId: string, hostId?: string, reason?: CloseReason) => number;
  updateGroup: (groupId: string, options: ToastUpdateOptions, hostId?: string) => number;
  isVisible: (id: ToastId, hostId?: string) => boolean;
}
