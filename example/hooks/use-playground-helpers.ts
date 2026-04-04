import { useState } from "react";
import { useToast } from "react-native-toast-system/hooks";
import { toast } from "react-native-toast-system/utils";
type DemoHostId =
  | "root"
  | "secondary-host"
  | "secondary-host/nested"
  | "classic-host";

interface LastToastMeta {
  id: string;
  hostId: DemoHostId;
}
export function usePlaygroundHelpers() {
  const secondaryToast = useToast("secondary-host");
  const classicToast = useToast("classic-host");
  const [lastToastMeta, setLastToastMeta] = useState<LastToastMeta | null>(
    null,
  );

  const rememberToast = (id: string, hostId: DemoHostId = "root") => {
    setLastToastMeta({ id, hostId });
  };

  const resolveControllerForHost = (hostId: DemoHostId) => {
    if (hostId === "secondary-host") return secondaryToast;
    if (hostId === "secondary-host/nested")
      return toast.host("secondary-host/nested");
    if (hostId === "classic-host") return classicToast;
    return toast;
  };

  const runSuccessPromise = () => {
    void toast.promise(
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("Server acknowledged payload"), 1200);
      }),
      {
        loading: { title: "Syncing", description: "Contacting backend..." },
        success: (value) => ({
          title: "Success",
          description: value,
          variant: "success",
        }),
        error: (error) => ({
          title: "Failure",
          description: String(error),
          variant: "error",
        }),
      },
    );
  };

  const runFailurePromise = () => {
    void toast.promise(
      new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Network timeout")), 900);
      }),
      {
        loading: { title: "Syncing", description: "Waiting for response..." },
        success: "Unexpected success",
        error: (error) => ({
          title: "Expected error",
          description: error instanceof Error ? error.message : String(error),
          variant: "error",
        }),
      },
    );
  };

  return {
    secondaryToast,
    classicToast,
    lastToastMeta,
    rememberToast,
    resolveControllerForHost,
    runSuccessPromise,
    runFailurePromise,
  };
}
