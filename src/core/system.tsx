import { useMemo, type ReactElement } from "react";
import {
  ToastHost as BaseToastHost,
  ToastViewport as BaseToastViewport,
} from "../components/toast-host";
import { toast as globalToast } from "./global-bridge";
import {
  createBoundToastProvider,
} from "../providers/toast-provider";
import { useToastContext } from "../context";
import { createToastTemplateRegistry } from "../components/toast-templates";
import type {
  CloseReason,
  ToastController,
  ToastHostProps,
  ToastId,
  ToastHostConfig,
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

export type TypedToastOptions<TTemplateName extends string> = Omit<
  ToastOptions,
  "template"
> & {
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
  update: (
    id: ToastId,
    options: TypedToastUpdateOptions<TTemplateName>,
  ) => boolean;
  dismiss: (id: ToastId, reason?: CloseReason) => boolean;
  dismissAll: (reason?: CloseReason) => void;
  dismissGroup: (groupId: string, reason?: CloseReason) => number;
  updateGroup: (
    groupId: string,
    options: TypedToastUpdateOptions<TTemplateName>,
  ) => number;
  isVisible: (id: ToastId) => boolean;
};

export type TypedToastGlobal<TTemplateName extends string> = Omit<
  TypedToastController<TTemplateName>,
  "hostId"
> & { host: (hostId: string) => TypedToastController<TTemplateName> };

export type TypedToastHostConfig<TTemplateName extends string> = ToastHostConfig extends infer TConfig
  ? TConfig extends ToastHostConfig
    ? Omit<TConfig, "defaultTemplate"> & { defaultTemplate?: TTemplateName }
    : never
  : never;

type TypedHostConfigFromBase<
  TConfig extends ToastHostConfig,
  TTemplateName extends string,
> = Omit<TConfig, "defaultTemplate"> & { defaultTemplate?: TTemplateName };

export type TypedToastProviderProps<TTemplateName extends string> = Omit<
  ToastProviderProps,
  "defaultHostConfig"
> & {
  defaultHostConfig?: TypedToastHostConfig<TTemplateName>;
};

type TypedHostPropsFromBase<TBaseProps, TTemplateName extends string> =
  TBaseProps extends { config?: infer TConfig }
    ? Omit<TBaseProps, "config"> & {
        config?: TConfig extends ToastHostConfig
          ? TypedHostConfigFromBase<TConfig, TTemplateName>
          : TConfig;
      }
    : TBaseProps;

export type TypedToastHostProps<TTemplateName extends string> =
  TypedHostPropsFromBase<ToastHostProps, TTemplateName>;

export type TypedToastViewportProps<TTemplateName extends string> =
  TypedToastHostProps<TTemplateName>;

export type TypedToastSystem<TTemplateName extends string> = {
  ToastProvider: (
    props: TypedToastProviderProps<TTemplateName>,
  ) => ReactElement;
  ToastHost: (props: TypedToastHostProps<TTemplateName>) => ReactElement;
  ToastViewport: (
    props: TypedToastViewportProps<TTemplateName>,
  ) => ReactElement;
  useToast: (hostId?: string) => TypedToastController<TTemplateName>;
  toast: TypedToastGlobal<TTemplateName>;
  templates: Record<TTemplateName, ToastTemplateRenderer>;
};

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

export function createToastSystem<
  const TTemplates extends ToastTemplateMap = {},
>(config?: { templates?: TTemplates }) {
  type TemplateName = ToastTemplateNameFromMap<TTemplates>;

  const resolvedTemplates = createToastTemplateRegistry(
    config?.templates as ToastTemplateRegistry | undefined,
  ) as Record<TemplateName, ToastTemplateRenderer>;
  const BoundToastProvider = createBoundToastProvider(resolvedTemplates);

  function ToastProvider(props: TypedToastProviderProps<TemplateName>) {
    return <BoundToastProvider {...(props as ToastProviderProps)} />;
  }

  function ToastHost(props: TypedToastHostProps<TemplateName>) {
    return <BaseToastHost {...(props as ToastHostProps)} />;
  }

  function ToastViewport(props: TypedToastViewportProps<TemplateName>) {
    return <BaseToastViewport {...(props as ToastHostProps)} />;
  }

  function useToast(hostId?: string): TypedToastController<TemplateName> {
    const context = useToastContext();

    return useMemo(() => {
      const controller = context.store.createController(
        hostId ?? context.defaultHostId,
      );
      return castController<TemplateName>(controller);
    }, [context.defaultHostId, context.store, hostId]);
  }

  const toast = globalToast as unknown as TypedToastGlobal<TemplateName>;

  const system: TypedToastSystem<TemplateName> = {
    ToastProvider,
    ToastHost,
    ToastViewport,
    useToast,
    toast,
    templates: resolvedTemplates,
  };

  return system;
}
