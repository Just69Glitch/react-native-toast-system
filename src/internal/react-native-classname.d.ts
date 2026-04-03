import "react-native";
import "react-native-gesture-handler";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }
}

declare module "react-native-gesture-handler" {
  interface GestureHandlerRootViewProps {
    className?: string;
    unstable_forceActive?: boolean;
  }
}
