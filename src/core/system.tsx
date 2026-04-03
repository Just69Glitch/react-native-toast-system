import { useMemo } from "react";
import { ToastHost, ToastViewport } from "../components/toast-host";
import { toast as globalToast } from "./global-bridge";
import { ToastProvider as BaseToastProvider } from "../providers/toast-provider";
import { useToastContext } from "../context";
import { createToastTemplateRegistry } from "../components/toast-templates";
import type {
  CloseReason,
  ToastController,
  ToastId,
  ToastOptions,
  ToastPromiseOptions,
  ToastProviderProps,
  ToastTemplate,
  ToastTemplateRegistry,
  ToastTemplateRenderer,
  ToastUpdateOptions,
} from "../types";

export type ToastTemplateMap = Record<string, ToastTemplateRenderer>;
export type ToastTemplateNameFromMap<TTemplates extends ToastTemplateMap> =
  | ToastTemplate
  | Extract<keyof TTemplates, string>;

export type TypedToastOptions<TTemplateName extends string> = Omit<ToastOptions, "template"> & {
  template?: TTemplateName;
};

export type TypedToastUpdateOptions<TTemplateName extends string> = Omit<
  ToastUpdateOptions,
  "template"
> & { template?: TTemplateName };

type TypedSuccessOption<T, TTemplateName extends string> =
  | string
  | TypedToastOptions<TTemplateName>
  | ((value: T) => string | TypedToastOptions<TTemplateName>);

type TypedErrorOption<TTemplateName extends string> =
  | string
  | TypedToastOptions<TTemplateName>
  | ((error: unknown) => string | TypedToastOptions<TTemplateName>);

export type TypedToastPromiseOptions<T, TTemplateName extends string> = Omit<
  ToastPromiseOptions<T>,
  "loading" | "success" | "error" | "finally"
> & {
  loading: string | TypedToastOptions<TTemplateName>;
  success?: TypedSuccessOption<T, TTemplateName>;
  error?: TypedErrorOption<TTemplateName>;
  finally?: TypedToastUpdateOptions<TTemplateName>;
};

export type TypedToastController<TTemplateName extends string> = {
  readonly hostId: string;
  show: (options: string | TypedToastOptions<TTemplateName>) => ToastId;
  success: (options: string | TypedToastOptions<TTemplateName>) => ToastId;
  error: (options: string | TypedToastOptions<TTemplateName>) => ToastId;
  warning: (options: string | TypedToastOptions<TTemplateName>) => ToastId;
  info: (options: string | TypedToastOptions<TTemplateName>) => ToastId;
  loading: (options: string | TypedToastOptions<TTemplateName>) => ToastId;
  promise: <T>(
    promise: Promise<T>,
    options: TypedToastPromiseOptions<T, TTemplateName>,
    commonOptions?: Partial<TypedToastOptions<TTemplateName>>,
  ) => Promise<T>;
  update: (id: ToastId, options: TypedToastUpdateOptions<TTemplateName>) => boolean;
  dismiss: (id: ToastId, reason?: CloseReason) => boolean;
  dismissAll: (reason?: CloseReason) => void;
  dismissGroup: (groupId: string, reason?: CloseReason) => number;
  updateGroup: (groupId: string, options: TypedToastUpdateOptions<TTemplateName>) => number;
  isVisible: (id: ToastId) => boolean;
};

export type TypedToastGlobal<TTemplateName extends string> = Omit<
  TypedToastController<TTemplateName>,
  "hostId"
> & { host: (hostId: string) => TypedToastController<TTemplateName> };

type ToastProviderWithoutTemplates = Omit<ToastProviderProps, "templates">;

function castController<TTemplateName extends string>(
  controller: ToastController,
): TypedToastController<TTemplateName> {
  return controller as unknown as TypedToastController<TTemplateName>;
}

export function createToastTemplates<const TTemplates extends ToastTemplateMap>(
  templates: TTemplates,
) {
  return createToastTemplateRegistry(templates) as Record<
    ToastTemplateNameFromMap<TTemplates>,
    ToastTemplateRenderer
  >;
}

export function createToastSystem<const TTemplates extends ToastTemplateMap = {}>(config?: {
  templates?: TTemplates;
}) {
  type TemplateName = ToastTemplateNameFromMap<TTemplates>;

  const resolvedTemplates = createToastTemplateRegistry(
    config?.templates as ToastTemplateRegistry | undefined,
  ) as Record<TemplateName, ToastTemplateRenderer>;

  function ToastProvider(props: ToastProviderWithoutTemplates) {
    return <BaseToastProvider {...props} templates={resolvedTemplates} />;
  }

  function useToast(hostId?: string): TypedToastController<TemplateName> {
    const context = useToastContext();

    return useMemo(() => {
      const controller = context.store.createController(hostId ?? context.defaultHostId);
      return castController<TemplateName>(controller);
    }, [context.defaultHostId, context.store, hostId]);
  }

  // Typed facade only:
  // this does not create an isolated runtime toast instance.
  // The returned `toast` still uses the shared global bridge bound by ToastProvider.
  const toast = globalToast as unknown as TypedToastGlobal<TemplateName>;

  return { ToastProvider, ToastHost, ToastViewport, useToast, toast, templates: resolvedTemplates };
}



