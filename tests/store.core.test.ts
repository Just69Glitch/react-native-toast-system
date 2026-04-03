import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastStore } from "../src/core/store";
import type { ToastInteractionMode } from "../src/types/internal";

function createStore(
  defaultHostConfig?: Record<string, unknown>,
  interactionMode: ToastInteractionMode = "deck",
) {
  const store = new ToastStore({
    defaultHostId: "root",
    defaultHostConfig,
  });
  store.registerHost("root", defaultHostConfig, interactionMode);
  return store;
}

function getHost(store: ToastStore, hostId = "root") {
  const host = store.getSnapshot().hosts[hostId];
  expect(host).toBeDefined();
  return host!;
}

describe("ToastStore core behavior", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows, dismisses, and completes close for a basic toast", () => {
    const store = createStore({ duration: "persistent" });
    const id = store.show("Hello");

    expect(store.isVisible(id, "root")).toBe(true);
    expect(getHost(store).toasts).toHaveLength(1);
    expect(getHost(store).toasts[0]?.title).toBe("Hello");

    expect(store.dismiss(id, "dismiss", "root")).toBe(true);
    expect(store.isVisible(id, "root")).toBe(false);
    expect(store.completeClose(id, "root")).toBe(true);
    expect(getHost(store).toasts).toHaveLength(0);
  });

  it("enforces host hard limit and keeps newest toasts under burst load", () => {
    const store = createStore(
      {
        duration: "persistent",
        classicMaxVisible: 1,
        classicOverflowBuffer: 1,
        maxStackSize: 4,
      },
      "classic",
    );

    for (let index = 1; index <= 8; index += 1) {
      store.show({ id: `t-${index}`, title: `Toast ${index}` });
    }

    const host = getHost(store);
    expect(host.toasts).toHaveLength(4);
    expect(host.toasts.map((toast) => toast.id)).toEqual(["t-5", "t-6", "t-7", "t-8"]);
  });

  it("routes toasts to targeted and nested hosts", () => {
    const store = createStore({ duration: "persistent" });
    store.registerHost("parent");
    store.registerHost("parent/child");

    const parentId = store.createController("parent").show("Parent");
    const childId = store.createController("parent/child").show("Child");
    const nestedId = store.createController("parent/child/grandchild").show("Nested");

    expect(getHost(store, "parent").toasts.map((toast) => toast.id)).toEqual([parentId]);
    expect(getHost(store, "parent/child").toasts.map((toast) => toast.id)).toEqual([childId]);
    expect(getHost(store, "parent/child/grandchild").toasts.map((toast) => toast.id)).toEqual([
      nestedId,
    ]);
  });

  it("dedupes by key and updates-in-group when requested", () => {
    const store = createStore({ duration: "persistent" });

    const firstDedupeId = store.show({ title: "Old", dedupeKey: "same" });
    const secondDedupeId = store.show({ title: "New", dedupeKey: "same" });
    expect(secondDedupeId).toBe(firstDedupeId);
    expect(getHost(store).toasts).toHaveLength(1);
    expect(getHost(store).toasts[0]?.title).toBe("New");

    const firstGroupId = store.show({
      title: "Group A",
      groupId: "g-1",
      groupBehavior: "update-in-group",
    });
    const secondGroupId = store.show({
      title: "Group B",
      groupId: "g-1",
      groupBehavior: "update-in-group",
    });

    expect(secondGroupId).toBe(firstGroupId);
    const grouped = getHost(store).toasts.filter((toast) => toast.groupId === "g-1");
    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.title).toBe("Group B");
  });

  it("supports promise lifecycle transitions for success and error", async () => {
    const store = createStore({ duration: "persistent" });
    const controller = store.createController("root");

    const successResult = await controller.promise(Promise.resolve("ok"), {
      loading: "Loading",
      success: (value) => ({ title: `Done ${value}` }),
    });
    expect(successResult).toBe("ok");
    expect(getHost(store).toasts).toHaveLength(1);
    expect(getHost(store).toasts[0]?.variant).toBe("success");
    expect(getHost(store).toasts[0]?.title).toBe("Done ok");

    const failure = new Error("boom");
    await expect(
      controller.promise(Promise.reject(failure), {
        loading: "Loading 2",
        error: (error) => ({ title: (error as Error).message }),
      }),
    ).rejects.toThrow("boom");

    const latest = getHost(store).toasts.at(-1);
    expect(latest?.variant).toBe("error");
    expect(latest?.title).toBe("boom");
  });

  it("blocks swipe dismiss for non-dismissible toasts and manages timer pause/resume", () => {
    vi.useFakeTimers();

    const store = createStore({ duration: 1000, animationDuration: 100 });
    const swipeGuardId = store.show({ title: "Guarded", dismissible: false, duration: "persistent" });

    expect(store.dismiss(swipeGuardId, "swipe", "root")).toBe(false);
    expect(store.isVisible(swipeGuardId, "root")).toBe(true);
    expect(store.dismiss(swipeGuardId, "programmatic", "root")).toBe(true);
    expect(store.completeClose(swipeGuardId, "root")).toBe(true);

    const timedId = store.show({ title: "Timed", duration: 1000 });
    vi.advanceTimersByTime(400);

    store.pauseTimer(timedId, "root");
    vi.advanceTimersByTime(2000);
    expect(store.isVisible(timedId, "root")).toBe(true);

    store.resumeTimer(timedId, "root");
    vi.advanceTimersByTime(599);
    expect(store.isVisible(timedId, "root")).toBe(true);

    vi.advanceTimersByTime(1);
    expect(store.isVisible(timedId, "root")).toBe(false);
    expect(store.completeClose(timedId, "root")).toBe(true);
  });

  it("handles high-volume enqueue and cleanup without leaking visible toasts", () => {
    const store = createStore(
      {
        duration: "persistent",
        classicMaxVisible: 2,
        classicOverflowBuffer: 1,
        maxStackSize: 8,
      },
      "classic",
    );

    for (let index = 0; index < 200; index += 1) {
      store.show({ id: `burst-${index}`, title: `Burst ${index}` });
    }

    const ids = getHost(store).toasts.map((toast) => toast.id);
    expect(ids.length).toBeLessThanOrEqual(getHost(store).config.maxStackSize);

    store.dismissAll("root", "programmatic");
    for (const id of ids) {
      store.completeClose(id, "root");
    }

    expect(getHost(store).toasts).toHaveLength(0);
  });
});
