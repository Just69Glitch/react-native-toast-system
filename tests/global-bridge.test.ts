import { afterEach, describe, expect, it } from "vitest";
import { bindToastBridge, toast, unbindToastBridge } from "../src/core/global-bridge";
import { ToastStore } from "../src/core/store";

function createStore() {
  return new ToastStore({
    defaultHostId: "root",
    defaultHostConfig: { duration: "persistent" },
  });
}

describe("global toast bridge", () => {
  afterEach(() => {
    bindToastBridge(null);
  });

  it("returns fallback ids and no-op behavior when provider bridge is missing", async () => {
    const id = toast.show("Without provider");
    expect(id.startsWith("toast-missing-provider-")).toBe(true);

    expect(toast.update("missing", { title: "noop" })).toBe(false);
    expect(toast.dismiss("missing")).toBe(false);
    expect(toast.dismissGroup("missing")).toBe(0);
    expect(toast.updateGroup("missing", { title: "noop" })).toBe(0);
    expect(toast.isVisible("missing")).toBe(false);

    const result = await toast.promise(Promise.resolve("ok"), { loading: "Loading" });
    expect(result).toBe("ok");
  });

  it("routes calls through the active bridge and host-specific controller", () => {
    const store = createStore();
    bindToastBridge(store);

    const defaultId = toast.show("Hello");
    expect(store.getSnapshot().hosts.root?.toasts.map((item) => item.id)).toContain(defaultId);

    const hostId = toast.host("sheet-host").show("From host");
    expect(store.getSnapshot().hosts["sheet-host"]?.toasts.map((item) => item.id)).toContain(hostId);

    expect(toast.dismiss(defaultId, "programmatic")).toBe(true);
    expect(store.completeClose(defaultId, "root")).toBe(true);

    unbindToastBridge(store);
    expect(toast.show("After unbind").startsWith("toast-missing-provider-")).toBe(true);
  });
});
