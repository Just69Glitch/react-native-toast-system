import { useEffect, useMemo } from "react";
import { DEFAULT_HOST_ID } from "../constants/toast-constants";
import { ToastContext } from "../context";
import { bindToastBridge, unbindToastBridge } from "../core/global-bridge";
import { ToastStore } from "../core/store";
import { createToastTemplateRegistry } from "../components/toast-templates";
import type { ToastProviderProps } from "../types";

export function ToastProvider({
  children,
  defaultHostId = DEFAULT_HOST_ID,
  defaultHostConfig,
  templates,
  debug,
  useRNScreensOverlay,
  rnScreensOverlayViewStyle,
}: ToastProviderProps) {
  const normalizedDefaultHostConfig = useMemo(() => {
    return {
      ...defaultHostConfig,
      debug: defaultHostConfig?.debug ?? debug ?? false,
      useRNScreensOverlay:
        defaultHostConfig?.useRNScreensOverlay ?? useRNScreensOverlay ?? false,
      rnScreensOverlayViewStyle:
        defaultHostConfig?.rnScreensOverlayViewStyle ?? rnScreensOverlayViewStyle,
    };
  }, [debug, defaultHostConfig, rnScreensOverlayViewStyle, useRNScreensOverlay]);

  const store = useMemo(() => {
    return new ToastStore({
      defaultHostId,
      defaultHostConfig: normalizedDefaultHostConfig,
    });
  }, [defaultHostId]);

  const resolvedTemplates = useMemo(() => {
    return createToastTemplateRegistry(templates);
  }, [templates]);

  useEffect(() => {
    store.registerHost(defaultHostId, normalizedDefaultHostConfig);
  }, [defaultHostId, normalizedDefaultHostConfig, store]);

  useEffect(() => {
    bindToastBridge(store);
    return () => {
      unbindToastBridge(store);
    };
  }, [store]);

  const contextValue = useMemo(() => {
    return {
      store,
      defaultHostId,
      templates: resolvedTemplates,
    };
  }, [defaultHostId, resolvedTemplates, store]);

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}

