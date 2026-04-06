import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { AccessibilityInfo, I18nManager, useColorScheme } from "react-native";
import Animated, {
  Easing,
  LinearTransition,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TOAST_PRESET_MOTION } from "../constants/toast-constants";
import { renderToastTemplate } from "./toast-templates";
import type {
  CloseReason,
  ResolvedClassicToastHostConfig,
  ResolvedDeckToastHostConfig,
  ResolvedToastHostConfig,
  ToastAction,
  ToastPosition,
  ToastRecord,
  ToastTemplateRegistry,
} from "../types/internal";
import {
  resolveAnimationDuration,
  resolveAnimationPreset,
  resolveDismissible,
  resolveGestureConfig,
  resolveToastResolvedTheme,
  resolvePauseOnDrag,
  resolvePauseOnPress,
  resolveToastDirection,
} from "../utils/toast-utils";
import { scheduleOnRN } from "react-native-worklets";
import { ToastStore } from "../core/store";

function toSpringConfig(damping: number, stiffness: number) {
  return { damping, stiffness, mass: 0.85 };
}

type ToastItemCommonProps = {
  toast: ToastRecord;
  hostConfig: ResolvedToastHostConfig;
  hostId: string;
  position: ToastPosition;
  stackOpacity: number;
  stackScale: number;
  stackTranslate: number;
  zIndex: number;
  templates: ToastTemplateRegistry;
  store: ToastStore;
};

type ClassicToastItemProps = ToastItemCommonProps & {
  hostConfig: ResolvedClassicToastHostConfig;
  interactionMode: "classic";
  deckState?: never;
  canHorizontalDismiss?: never;
  onInteraction?: never;
};

type DeckToastItemProps = ToastItemCommonProps & {
  hostConfig: ResolvedDeckToastHostConfig;
  interactionMode: "deck";
  deckState: "collapsed" | "expanded";
  canHorizontalDismiss: boolean;
  onInteraction?: () => void;
};

type ToastItemProps = ClassicToastItemProps | DeckToastItemProps;

function getDirectionalSign(position: ToastPosition): number {
  "worklet";
  return position === "top" ? -1 : 1;
}

function shouldDismissForPosition(
  position: ToastPosition,
  translationY: number,
): boolean {
  "worklet";
  return position === "top" ? translationY < 0 : translationY > 0;
}

function toHorizontalDirection(value: number): number {
  "worklet";
  return value >= 0 ? 1 : -1;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ToastItemImpl(props: ToastItemProps) {
  const {
    toast,
    hostConfig,
    hostId,
    position,
    stackOpacity,
    stackScale,
    stackTranslate,
    zIndex,
    templates,
    store,
    interactionMode,
  } = props;
  const deckState = interactionMode === "deck" ? props.deckState : undefined;
  const canHorizontalDismiss =
    interactionMode === "deck" ? props.canHorizontalDismiss : false;
  const onInteraction =
    interactionMode === "deck" ? props.onInteraction : undefined;
  const colorScheme = useColorScheme();
  const resolvedTheme = useMemo(
    () => resolveToastResolvedTheme(hostConfig.theme, colorScheme),
    [colorScheme, hostConfig.theme],
  );
  const resolvedDirection = useMemo(
    () =>
      resolveToastDirection(
        toast.direction ?? hostConfig.direction,
        I18nManager.isRTL,
      ),
    [hostConfig.direction, toast.direction],
  );

  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const preset = resolveAnimationPreset(toast, hostConfig);
  const duration = resolveAnimationDuration(toast, hostConfig);
  const motion = TOAST_PRESET_MOTION[preset];
  const gestureConfig = resolveGestureConfig(toast, hostConfig);
  const dismissible = resolveDismissible(toast, hostConfig);
  const pauseOnDrag = resolvePauseOnDrag(toast, hostConfig);
  const pauseOnPress = resolvePauseOnPress(toast, hostConfig);
  const stackDuration = Math.max(
    90,
    Math.round(duration * motion.stackDurationMultiplier),
  );
  const springConfig = useMemo(
    () => toSpringConfig(motion.springDamping, motion.springStiffness),
    [motion.springDamping, motion.springStiffness],
  );
  const restoreSpringConfig = useMemo(
    () => toSpringConfig(motion.restoreDamping, motion.restoreStiffness),
    [motion.restoreDamping, motion.restoreStiffness],
  );

  const closeReasonRef = useRef<CloseReason | undefined>(toast.closeReason);
  const swipeAxisRef = useRef<"vertical" | "horizontal">("vertical");
  const swipeDirectionRef = useRef<number>(0);
  const swipeVelocityRef = useRef<number>(0);

  const isClosingSV = useSharedValue(false);
  const closeCompleteSV = useSharedValue(false);
  const pendingDismissSV = useSharedValue(false);

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(motion.enterScale);
  const depthOpacity = useSharedValue(stackOpacity);
  const depthScale = useSharedValue(stackScale);
  const depthTranslate = useSharedValue(stackTranslate);
  const continuityScale = useSharedValue(1);
  const gestureSettledOnEnd = useSharedValue(false);

  const notifyOpen = useCallback(
    (id: string, host: string) => {
      store.notifyOpen(id, host);
    },
    [store],
  );

  const pauseTimer = useCallback(() => {
    store.pauseTimer(toast.id, hostId);
  }, [hostId, store, toast.id]);

  const resumeTimer = useCallback(() => {
    store.resumeTimer(toast.id, hostId);
  }, [hostId, store, toast.id]);

  const restoreFromInterruptedState = useCallback(() => {
    pendingDismissSV.value = false;
    swipeAxisRef.current = "vertical";
    swipeDirectionRef.current = 0;
    swipeVelocityRef.current = 0;
    translateX.value = withSpring(0, restoreSpringConfig);
    translateY.value = withSpring(0, restoreSpringConfig);
    opacity.value = withTiming(1, {
      duration: Math.min(220, duration),
      easing: Easing.out(Easing.quad),
    });
    if (isReducedMotionEnabled) {
      scale.value = 1;
    } else {
      scale.value = withSpring(1, restoreSpringConfig);
    }
  }, [
    duration,
    isReducedMotionEnabled,
    opacity,
    restoreSpringConfig,
    scale,
    translateX,
    translateY,
  ]);

  const completeClose = useCallback(() => {
    if (closeCompleteSV.value) {
      return;
    }
    pendingDismissSV.value = false;
    closeCompleteSV.value = true;
    store.completeClose(toast.id, hostId, closeReasonRef.current);
  }, [hostId, store, toast.id]);

  const requestSwipeDismiss = useCallback(
    (axis: "vertical" | "horizontal", direction: number, velocity: number) => {
      swipeAxisRef.current = axis;
      swipeDirectionRef.current = direction;
      swipeVelocityRef.current = velocity;
      const dismissed = store.dismiss(toast.id, "swipe", hostId);
      if (!dismissed) {
        restoreFromInterruptedState();
        store.resumeTimer(toast.id, hostId);
      }
    },
    [hostId, restoreFromInterruptedState, store, toast.id],
  );

  const runExitAnimation = useCallback(
    (reason?: CloseReason) => {
      closeReasonRef.current = reason;
      const swipeVelocity = Math.abs(swipeVelocityRef.current);
      const velocityStrength = clampNumber(swipeVelocity / 1900, 0, 1.4);
      const exitOffset = motion.exitOffset + duration * 0.03;
      const horizontalSwipeExit =
        interactionMode === "deck" &&
        reason === "swipe" &&
        swipeAxisRef.current === "horizontal" &&
        swipeDirectionRef.current !== 0;
      const verticalSign = getDirectionalSign(position);
      const horizontalSign = swipeDirectionRef.current || 1;
      const baseExitDuration = isReducedMotionEnabled
        ? Math.max(80, Math.round(duration * 0.4))
        : Math.max(120, Math.round(duration * 0.75));
      const velocityDurationMultiplier = clampNumber(
        1 - velocityStrength * 0.32,
        0.45,
        1,
      );
      const exitDuration = Math.max(
        80,
        Math.round(baseExitDuration * velocityDurationMultiplier),
      );
      const verticalExitDistance = clampNumber(
        exitOffset * (1 + velocityStrength * 0.55),
        Math.max(28, exitOffset),
        420,
      );
      const horizontalExitDistance = clampNumber(
        exitOffset * (1.7 + velocityStrength * 0.7),
        Math.max(72, exitOffset * 1.7),
        460,
      );
      pendingDismissSV.value = false;
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(scale);

      if (horizontalSwipeExit) {
        translateX.value = withTiming(horizontalSign * horizontalExitDistance, {
          duration: exitDuration,
          easing: Easing.in(Easing.cubic),
        });
        translateY.value = withTiming(0, {
          duration: exitDuration,
          easing: Easing.in(Easing.cubic),
        });
      } else {
        translateY.value = withTiming(verticalSign * verticalExitDistance, {
          duration: exitDuration,
          easing: Easing.in(Easing.cubic),
        });
      }

      opacity.value = withTiming(0, {
        duration: isReducedMotionEnabled
          ? Math.max(70, Math.round(duration * 0.35))
          : Math.max(100, Math.round(duration * 0.6)),
        easing: Easing.in(Easing.quad),
      });
      scale.value = withTiming(
        isReducedMotionEnabled ? 1 : motion.exitScale,
        {
          duration: isReducedMotionEnabled
            ? Math.max(70, Math.round(duration * 0.35))
            : Math.max(100, Math.round(duration * 0.65)),
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(completeClose);
          }
        },
      );
    },
    [
      completeClose,
      duration,
      interactionMode,
      isReducedMotionEnabled,
      motion.exitOffset,
      motion.exitScale,
      opacity,
      position,
      scale,
      translateX,
      translateY,
    ],
  );

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setIsReducedMotionEnabled(enabled);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsReducedMotionEnabled(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setIsReducedMotionEnabled(enabled);
      },
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const enterSign = position === "bottom" ? 1 : -1;
    translateX.value = 0;
    translateY.value = enterSign * motion.enterOffset;
    opacity.value = 0;
    scale.value = isReducedMotionEnabled ? 1 : motion.enterScale;

    if (isReducedMotionEnabled) {
      translateY.value = withTiming(0, {
        duration: Math.max(90, Math.round(duration * 0.4)),
        easing: Easing.out(Easing.quad),
      });
      scale.value = 1;
      opacity.value = withTiming(
        1,
        {
          duration: Math.max(90, Math.round(duration * 0.4)),
          easing: Easing.out(Easing.quad),
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(notifyOpen, toast.id, hostId);
          }
        },
      );
      return;
    }

    if (preset === "spring") {
      translateY.value = withSpring(0, springConfig);
      scale.value = withSpring(1, springConfig);
      opacity.value = withTiming(
        1,
        {
          duration: Math.max(120, motion.enterDuration),
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(notifyOpen, toast.id, hostId);
          }
        },
      );
    } else {
      translateY.value = withTiming(0, {
        duration: Math.max(120, duration),
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: Math.max(120, duration),
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(
        1,
        { duration: Math.max(120, duration), easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            scheduleOnRN(notifyOpen, toast.id, hostId);
          }
        },
      );
    }
  }, [
    duration,
    hostId,
    motion.enterDuration,
    motion.enterOffset,
    motion.enterScale,
    motion.springDamping,
    motion.springStiffness,
    isReducedMotionEnabled,
    opacity,
    position,
    preset,
    scale,
    springConfig,
    store,
    toast.id,
    translateX,
    translateY,
  ]);

  useEffect(() => {
    store.notifyMounted(toast.id, hostId);
  }, [hostId, store, toast.id]);

  useEffect(() => {
    depthOpacity.value = withTiming(stackOpacity, {
      duration: isReducedMotionEnabled ? 90 : stackDuration,
      easing: Easing.out(Easing.quad),
    });

    if (isReducedMotionEnabled) {
      depthScale.value = withTiming(1, {
        duration: 90,
        easing: Easing.out(Easing.quad),
      });
      depthTranslate.value = withTiming(stackTranslate, {
        duration: 90,
        easing: Easing.out(Easing.quad),
      });
      return;
    }

    if (preset === "spring") {
      depthScale.value = withSpring(stackScale, springConfig);
      depthTranslate.value = withSpring(stackTranslate, springConfig);
      return;
    }

    depthScale.value = withTiming(stackScale, {
      duration: stackDuration,
      easing: Easing.out(Easing.quad),
    });
    depthTranslate.value = withTiming(stackTranslate, {
      duration: stackDuration,
      easing: Easing.out(Easing.quad),
    });
  }, [
    depthOpacity,
    depthScale,
    depthTranslate,
    duration,
    isReducedMotionEnabled,
    preset,
    springConfig,
    stackDuration,
    stackOpacity,
    stackScale,
    stackTranslate,
  ]);

  useEffect(() => {
    if (!toast.groupId || toast.lifecycle.isClosing || isReducedMotionEnabled) {
      continuityScale.value = 1;
      return;
    }

    continuityScale.value =
      preset === "spring" ? 1.018 : preset === "snappy" ? 1.008 : 1.01;
    continuityScale.value = withTiming(1, {
      duration: preset === "snappy" ? 140 : 190,
      easing: Easing.out(Easing.cubic),
    });
  }, [
    continuityScale,
    isReducedMotionEnabled,
    preset,
    toast.groupId,
    toast.lifecycle.isClosing,
    toast.updatedAt,
  ]);

  useEffect(() => {
    if (toast.lifecycle.isClosing) {
      if (isClosingSV.value) {
        return;
      }
      isClosingSV.value = true;
      runExitAnimation(toast.closeReason);
      return;
    }

    if (isClosingSV.value) {
      isClosingSV.value = false;
      closeCompleteSV.value = false;
      closeReasonRef.current = undefined;
      swipeAxisRef.current = "vertical";
      swipeDirectionRef.current = 0;
      swipeVelocityRef.current = 0;
      restoreFromInterruptedState();
    }
  }, [
    restoreFromInterruptedState,
    runExitAnimation,
    toast.closeReason,
    toast.lifecycle.isClosing,
  ]);

  useEffect(() => {
    if (toast.lifecycle.isClosing) {
      return;
    }

    const fallback = setTimeout(() => {
      restoreFromInterruptedState();
    }, duration + 180);

    return () => {
      clearTimeout(fallback);
    };
  }, [
    duration,
    restoreFromInterruptedState,
    toast.lifecycle.isClosing,
    toast.updatedAt,
  ]);

  const dismissToast = useCallback(
    (reason: CloseReason = "dismiss") => {
      return store.dismiss(toast.id, reason, hostId);
    },
    [hostId, store, toast.id],
  );

  const updateToast = useCallback(
    (options: Parameters<ToastStore["update"]>[1]) => {
      return store.update(toast.id, options, hostId);
    },
    [hostId, store, toast.id],
  );

  const onPress = useCallback(() => {
    if (toast.lifecycle.isClosing) {
      return;
    }
    onInteraction?.();
    store.notifyPress(toast.id, hostId);
  }, [hostId, onInteraction, store, toast.id, toast.lifecycle.isClosing]);

  const onPressIn = useCallback(() => {
    if (!pauseOnPress || toast.lifecycle.isClosing) {
      return;
    }
    onInteraction?.();
    store.pauseTimer(toast.id, hostId);
  }, [
    hostId,
    onInteraction,
    pauseOnPress,
    store,
    toast.id,
    toast.lifecycle.isClosing,
  ]);

  const onPressOut = useCallback(() => {
    if (!pauseOnPress || toast.lifecycle.isClosing) {
      return;
    }
    onInteraction?.();
    store.resumeTimer(toast.id, hostId);
  }, [
    hostId,
    onInteraction,
    pauseOnPress,
    store,
    toast.id,
    toast.lifecycle.isClosing,
  ]);

  const onActionPress = useCallback(
    (_action: ToastAction, actionIndex: number) => {
      if (toast.lifecycle.isClosing) {
        return;
      }
      onInteraction?.();
      store.notifyActionPress(toast.id, actionIndex, hostId);
    },
    [hostId, onInteraction, store, toast.id, toast.lifecycle.isClosing],
  );

  const renderContext = useMemo(() => {
    return {
      toast,
      resolvedTheme,
      dismiss: dismissToast,
      update: updateToast,
      onPress,
      onPressIn,
      onPressOut,
      onActionPress,
    };
  }, [
    dismissToast,
    onActionPress,
    onPress,
    onPressIn,
    onPressOut,
    resolvedTheme,
    toast,
    updateToast,
  ]);

  const gestureEnabled =
    gestureConfig.enabled && dismissible && !toast.lifecycle.isClosing;
  const classicVerticalDismissEnabled =
    gestureEnabled && interactionMode === "classic";
  const deckHorizontalDismissEnabled =
    gestureEnabled &&
    interactionMode === "deck" &&
    (deckState === "expanded" || canHorizontalDismiss);

  const verticalPanGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(classicVerticalDismissEnabled)
      .activeOffsetY([-8, 8])
      .failOffsetX([-22, 22])
      .onBegin(() => {
        gestureSettledOnEnd.value = false;
        if (isClosingSV.value) {
          return;
        }
        if (pauseOnDrag) {
          scheduleOnRN(pauseTimer);
        }
        cancelAnimation(translateY);
        cancelAnimation(scale);
        scale.value = withTiming(motion.dragActiveScale, {
          duration: 90,
          easing: Easing.linear,
        });
      })
      .onUpdate((event) => {
        if (isClosingSV.value) {
          return;
        }

        let nextTranslation = event.translationY;

        if (position === "top" && nextTranslation > 0) {
          nextTranslation = nextTranslation / 4;
        }

        if (position === "bottom" && nextTranslation < 0) {
          nextTranslation = nextTranslation / 4;
        }

        translateY.value = nextTranslation;
      })
      .onEnd((event) => {
        if (isClosingSV.value) {
          return;
        }

        const translationY = event.translationY;
        const velocityY = event.velocityY;
        const absTranslation = Math.abs(translationY);
        const absVelocity = Math.abs(velocityY);

        const directionOkay = shouldDismissForPosition(position, translationY);

        const crossedDismissDistance =
          absTranslation >= gestureConfig.dismissThreshold;
        const crossedDismissVelocity =
          absVelocity >= gestureConfig.velocityThreshold;

        const shouldDismiss =
          directionOkay && (crossedDismissDistance || crossedDismissVelocity);

        const shouldCancel =
          absTranslation <= gestureConfig.cancelThreshold &&
          absVelocity < gestureConfig.velocityThreshold * 0.45;

        if (shouldCancel) {
          gestureSettledOnEnd.value = true;
          pendingDismissSV.value = false;
          translateY.value = withTiming(0, {
            duration: 95,
            easing: Easing.out(Easing.quad),
          });
          scale.value = withTiming(1, {
            duration: 95,
            easing: Easing.out(Easing.quad),
          });
          return;
        }

        if (shouldDismiss) {
          gestureSettledOnEnd.value = true;
          pendingDismissSV.value = true;
          scheduleOnRN(
            requestSwipeDismiss,
            "vertical",
            getDirectionalSign(position),
            Math.abs(velocityY),
          );
          return;
        }

        gestureSettledOnEnd.value = true;
        pendingDismissSV.value = false;
        translateY.value = withSpring(0, restoreSpringConfig);
        scale.value = withSpring(1, restoreSpringConfig);
      })
      .onFinalize(() => {
        if (
          !isClosingSV.value &&
          !pendingDismissSV.value &&
          !gestureSettledOnEnd.value
        ) {
          translateY.value = withSpring(0, restoreSpringConfig);
          scale.value = withSpring(1, restoreSpringConfig);
        }

        gestureSettledOnEnd.value = false;

        if (pauseOnDrag && !pendingDismissSV.value) {
          scheduleOnRN(resumeTimer);
        }
      });
  }, [
    classicVerticalDismissEnabled,
    gestureConfig.cancelThreshold,
    gestureConfig.dismissThreshold,
    gestureConfig.velocityThreshold,
    gestureSettledOnEnd,
    motion.dragActiveScale,
    pauseOnDrag,
    pauseTimer,
    position,
    requestSwipeDismiss,
    restoreSpringConfig,
    resumeTimer,
    scale,
    translateY,
  ]);

  const horizontalPanGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(deckHorizontalDismissEnabled)
      .activeOffsetX([-8, 8])
      .failOffsetY([-24, 24])
      .onBegin(() => {
        gestureSettledOnEnd.value = false;
        if (isClosingSV.value) {
          return;
        }
        if (onInteraction) {
          scheduleOnRN(onInteraction);
        }
        if (pauseOnDrag) {
          scheduleOnRN(pauseTimer);
        }
        cancelAnimation(translateX);
        cancelAnimation(scale);
        scale.value = withTiming(motion.dragActiveScale, {
          duration: 90,
          easing: Easing.linear,
        });
      })
      .onUpdate((event) => {
        if (isClosingSV.value) {
          return;
        }
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        if (isClosingSV.value) {
          return;
        }

        const translationX = event.translationX;
        const velocityX = event.velocityX;
        const absTranslation = Math.abs(translationX);
        const absVelocity = Math.abs(velocityX);
        const shouldDismiss =
          absTranslation >= gestureConfig.dismissThreshold ||
          absVelocity >= gestureConfig.velocityThreshold;
        const shouldCancel =
          absTranslation <= gestureConfig.cancelThreshold &&
          absVelocity < gestureConfig.velocityThreshold * 0.45;

        if (shouldCancel) {
          gestureSettledOnEnd.value = true;
          pendingDismissSV.value = false;
          translateX.value = withTiming(0, {
            duration: 95,
            easing: Easing.out(Easing.quad),
          });
          scale.value = withTiming(1, {
            duration: 95,
            easing: Easing.out(Easing.quad),
          });
          return;
        }

        if (shouldDismiss) {
          gestureSettledOnEnd.value = true;
          pendingDismissSV.value = true;
          const direction = toHorizontalDirection(
            translationX === 0 ? velocityX : translationX,
          );
          scheduleOnRN(
            requestSwipeDismiss,
            "horizontal",
            direction,
            Math.abs(velocityX),
          );
          return;
        }

        gestureSettledOnEnd.value = true;
        pendingDismissSV.value = false;
        translateX.value = withSpring(0, restoreSpringConfig);
        scale.value = withSpring(1, restoreSpringConfig);
      })
      .onFinalize(() => {
        if (
          !isClosingSV.value &&
          !pendingDismissSV.value &&
          !gestureSettledOnEnd.value
        ) {
          translateX.value = withSpring(0, restoreSpringConfig);
          scale.value = withSpring(1, restoreSpringConfig);
        }

        gestureSettledOnEnd.value = false;

        if (pauseOnDrag && !pendingDismissSV.value) {
          scheduleOnRN(resumeTimer);
        }
      });
  }, [
    deckHorizontalDismissEnabled,
    gestureConfig.cancelThreshold,
    gestureConfig.dismissThreshold,
    gestureConfig.velocityThreshold,
    gestureSettledOnEnd,
    motion.dragActiveScale,
    onInteraction,
    pauseOnDrag,
    pauseTimer,
    requestSwipeDismiss,
    restoreSpringConfig,
    resumeTimer,
    scale,
    translateX,
  ]);

  const activeGesture =
    interactionMode === "deck" ? horizontalPanGesture : verticalPanGesture;

  const animatedStyle = useAnimatedStyle(() => {
    const composedTranslateY = translateY.value + depthTranslate.value;
    return {
      opacity: opacity.value * depthOpacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: composedTranslateY },
        { scale: scale.value * depthScale.value * continuityScale.value },
      ],
      zIndex,
      elevation: zIndex,
    };
  }, [continuityScale, zIndex]);

  const layoutTransition = useMemo(() => {
    if (isReducedMotionEnabled) {
      return LinearTransition.duration(90).easing(Easing.linear);
    }

    if (preset === "spring") {
      return LinearTransition.springify()
        .damping(motion.springDamping)
        .stiffness(motion.springStiffness);
    }

    if (preset === "snappy") {
      return LinearTransition.duration(Math.max(90, duration * 0.45)).easing(
        Easing.out(Easing.exp),
      );
    }

    if (preset === "subtle") {
      return LinearTransition.duration(Math.max(140, duration * 0.82)).easing(
        Easing.out(Easing.cubic),
      );
    }

    return LinearTransition.duration(Math.max(120, duration * 0.7)).easing(
      Easing.out(Easing.cubic),
    );
  }, [
    duration,
    isReducedMotionEnabled,
    motion.springDamping,
    motion.springStiffness,
    preset,
  ]);

  const content = renderToastTemplate({
    toast,
    hostConfig,
    context: renderContext,
    templates,
  });

  return (
    <GestureDetector gesture={activeGesture}>
      <Animated.View
        layout={layoutTransition}
        pointerEvents={toast.lifecycle.isClosing ? "none" : "auto"}
        style={[animatedStyle, { direction: resolvedDirection }]}
      >
        {content}
      </Animated.View>
    </GestureDetector>
  );
}

export const ToastItem = memo(ToastItemImpl, (prev, next) => {
  const prevDeckState =
    prev.interactionMode === "deck" ? prev.deckState : undefined;
  const nextDeckState =
    next.interactionMode === "deck" ? next.deckState : undefined;
  const prevCanHorizontalDismiss =
    prev.interactionMode === "deck" ? prev.canHorizontalDismiss : false;
  const nextCanHorizontalDismiss =
    next.interactionMode === "deck" ? next.canHorizontalDismiss : false;
  const prevOnInteraction =
    prev.interactionMode === "deck" ? prev.onInteraction : undefined;
  const nextOnInteraction =
    next.interactionMode === "deck" ? next.onInteraction : undefined;

  return (
    prev.toast === next.toast &&
    prev.hostConfig === next.hostConfig &&
    prev.stackOpacity === next.stackOpacity &&
    prev.stackScale === next.stackScale &&
    prev.stackTranslate === next.stackTranslate &&
    prev.zIndex === next.zIndex &&
    prev.templates === next.templates &&
    prev.position === next.position &&
    prev.interactionMode === next.interactionMode &&
    prevDeckState === nextDeckState &&
    prevCanHorizontalDismiss === nextCanHorizontalDismiss &&
    prevOnInteraction === nextOnInteraction
  );
});
