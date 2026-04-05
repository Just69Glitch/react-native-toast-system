import { beforeEach, vi } from "vitest";

const DX_WARNING_PREFIX = "[react-native-toast-system][dx:";
const SHOW_DX_WARNINGS = process.env.VITEST_SHOW_DX_WARNINGS === "1";
const originalWarn = console.warn.bind(console);

beforeEach(() => {
  if (SHOW_DX_WARNINGS) {
    return;
  }

  vi.spyOn(console, "warn").mockImplementation((...args: Parameters<typeof console.warn>) => {
    const firstArg = args[0];
    if (typeof firstArg === "string" && firstArg.startsWith(DX_WARNING_PREFIX)) {
      return;
    }

    originalWarn(...args);
  });
});
