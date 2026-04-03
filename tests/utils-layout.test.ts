import { describe, expect, it } from "vitest";
import {
  getDeckCollapsedRenderedToasts,
  getRenderedToasts,
  isCollapseDirection,
  isDismissAllDirection,
  isExpandDirection,
  resolveStackContainerStyle,
  sortToastsByPriorityAndOrder,
} from "../src/core/stack-helpers";
import type { ToastRecord } from "../src/types/internal";
import {
  resolveDismissAllBehavior,
  resolveHostConfig,
  resolveKeyboardOffset,
  resolveToastDirection,
  resolveToastResolvedTheme,
} from "../src/utils/toast-utils";

function makeToast(id: string, order: number, overrides: Partial<ToastRecord> = {}): ToastRecord {
  return {
    id,
    hostId: "root",
    title: id,
    variant: "default",
    createdAt: order,
    updatedAt: order,
    order,
    lifecycle: {
      mounted: true,
      visible: true,
      isClosing: false,
    },
    ...overrides,
  };
}

describe("utils and stack helper behavior", () => {
  it("sorts by strict priority first, then order", () => {
    const hostConfig = resolveHostConfig({
      priorityMode: "strict",
      priorityWeight: 1000,
      duration: "persistent",
    });

    const toasts = [
      makeToast("low-new", 20, { priority: -1 }),
      makeToast("high-old", 1, { priority: 10 }),
      makeToast("high-new", 30, { priority: 10 }),
    ];

    const sorted = sortToastsByPriorityAndOrder(toasts, hostConfig);
    expect(sorted.map((item) => item.id)).toEqual(["high-new", "high-old", "low-new"]);
  });

  it("resolves stack container style for keyboard overlap handling", () => {
    const bottomStyle = resolveStackContainerStyle("bottom", 300, 12, 20);
    expect(bottomStyle.bottom).toBe(332);

    const topStyle = resolveStackContainerStyle("top", 999, 20, 16);
    expect(topStyle.top).toBe(16);
    expect(topStyle.bottom).toBeUndefined();
  });

  it("keeps closing toasts rendered beyond soft limit and clips when required", () => {
    const toasts = [
      makeToast("t1", 1),
      makeToast("t2", 2),
      makeToast("t3", 3, {
        lifecycle: { mounted: true, visible: false, isClosing: true },
      }),
      makeToast("t4", 4),
    ];

    const clipped = getRenderedToasts(toasts, 2, "clip", 1);
    expect(clipped.map((toast) => toast.id)).toEqual(["t1", "t2", "t3"]);

    const deckCollapsed = getDeckCollapsedRenderedToasts(
      [
        { toast: toasts[0], stackIndex: 0, zIndex: 10 },
        { toast: toasts[1], stackIndex: 1, zIndex: 9 },
        { toast: toasts[2], stackIndex: 2, zIndex: 8 },
      ],
      1,
    );
    expect(deckCollapsed.map((item) => item.toast.id)).toEqual(["t1", "t3"]);
  });

  it("resolves dismiss-all behavior, theme, keyboard offset, and direction helpers", () => {
    const classic = resolveHostConfig({}, "classic");
    expect(resolveDismissAllBehavior(classic)).toEqual({ enabled: false, confirmation: "none" });

    const deckDefault = resolveHostConfig(
      {
        dismissAllConfirmation: "default",
      },
      "deck",
    );
    expect(resolveDismissAllBehavior(deckDefault)).toEqual({
      enabled: true,
      confirmation: "default",
    });
    expect(deckDefault.deckGesture.dismissThreshold).toBe(48);
    expect(deckDefault.deckGesture.itemDismiss.dismissThreshold).toBe(48);
    expect(deckDefault.deckGesture.collapseHandle.velocityThreshold).toBe(900);

    const deckGestureOverride = resolveHostConfig(
      {
        deckGesture: {
          dismissThreshold: 64,
          collapseHandle: { velocityThreshold: 1200 },
        },
      },
      "deck",
    );
    expect(deckGestureOverride.deckGesture.itemDismiss.dismissThreshold).toBe(64);
    expect(deckGestureOverride.deckGesture.collapsedExpand.dismissThreshold).toBe(64);
    expect(deckGestureOverride.deckGesture.collapseHandle.velocityThreshold).toBe(1200);

    const classicGestureOverride = resolveHostConfig(
      {
        classicGesture: {
          dismissThreshold: 56,
          itemDismiss: { cancelThreshold: 9 },
        },
      },
      "classic",
    );
    expect(classicGestureOverride.classicGesture.itemDismiss.dismissThreshold).toBe(56);
    expect(classicGestureOverride.classicGesture.itemDismiss.cancelThreshold).toBe(9);

    const customConfirm = () => true;
    const deckCustom = resolveHostConfig(
      {
        dismissAllConfirmation: customConfirm,
      },
      "deck",
    );
    const behavior = resolveDismissAllBehavior(deckCustom);
    expect(behavior.enabled).toBe(true);
    expect(behavior.confirmation).toBe("custom");
    expect(behavior.confirm).toBe(customConfirm);

    expect(resolveToastResolvedTheme("auto", "dark")).toBe("dark");
    expect(resolveToastResolvedTheme("auto", "light")).toBe("light");
    expect(resolveToastResolvedTheme("light", "dark")).toBe("light");

    expect(resolveKeyboardOffset({ keyboardOffset: -20 }, deckDefault)).toBe(0);
    expect(resolveKeyboardOffset({ keyboardOffset: 24 }, deckDefault)).toBe(24);

    expect(resolveHostConfig({ direction: "rtl" }).direction).toBe("rtl");
    expect(resolveHostConfig({ direction: "ltr" }).direction).toBe("ltr");
    expect(resolveHostConfig({}).direction).toBe("auto");

    expect(resolveToastDirection("ltr")).toBe("ltr");
    expect(resolveToastDirection("rtl")).toBe("rtl");
    expect(resolveToastDirection("auto")).toBe("ltr");
    expect(resolveToastDirection("auto", true)).toBe("rtl");

    expect(deckDefault.collapseHandleStyle).toEqual({
      width: 48,
      height: 4,
      borderRadius: 999,
      backgroundColor: undefined,
      opacity: 0.9,
      marginTop: 6,
      marginBottom: 2,
    });

    const clampedHandleConfig = resolveHostConfig(
      {
        collapseHandleStyle: {
          width: -20,
          height: 99,
          borderRadius: -2,
          backgroundColor: "   ",
          opacity: 99,
          marginTop: -5,
          marginBottom: 99,
        },
      },
      "deck",
    );
    expect(clampedHandleConfig.collapseHandleStyle).toEqual({
      width: 16,
      height: 24,
      borderRadius: 0,
      backgroundColor: undefined,
      opacity: 1,
      marginTop: 0,
      marginBottom: 24,
    });

    expect(isExpandDirection("top", 10)).toBe(true);
    expect(isCollapseDirection("top", -10)).toBe(true);
    expect(isDismissAllDirection("bottom", 10)).toBe(true);
  });
});
