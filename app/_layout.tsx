import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import AuthProfileContextProvider from "@/context/AuthProfileContext";
import AuthUserContextProvider from "@/context/AuthUserContext";
import ColorModeContextProvider from "@/context/ColorModeContext";
import AuthInterceptor from "@/interceptors/AuthInterceptor";

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  // set system background color to prevent random light screen flashes in dark mode
  // flashes occur when navigating back screens or underneath the keyboard when it is opening
  SystemUI.setBackgroundColorAsync(isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50]);

  return (
    <GestureHandlerRootView>
      <AuthUserContextProvider>
        <AuthProfileContextProvider>
          <ColorModeContextProvider>
            <AuthInterceptor>
              <BottomSheetModalProvider>
                <Stack
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
                    },
                    headerShadowVisible: false, // applied here
                    contentStyle: {
                      backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
                    },
                  }}
                >
                  <Stack.Screen name="auth" options={{ title: "", headerShown: false }} />
                  <Stack.Screen name="(app)" options={{ title: "Home", headerShown: false }} />
                </Stack>
                <Toast config={toastConfig} />
              </BottomSheetModalProvider>
            </AuthInterceptor>
          </ColorModeContextProvider>
        </AuthProfileContextProvider>
      </AuthUserContextProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
