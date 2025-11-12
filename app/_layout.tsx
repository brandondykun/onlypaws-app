import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import { AdsConfigProvider } from "@/context/AdsConfigContext";
import AuthProfileContextProvider from "@/context/AuthProfileContext";
import AuthUserContextProvider from "@/context/AuthUserContext";
import ColorModeContextProvider from "@/context/ColorModeContext";
import AuthInterceptor from "@/interceptors/AuthInterceptor";
import { adService } from "@/services/ads/adService";

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  // set system background color to prevent random light screen flashes in dark mode
  // flashes occur when navigating back screens or underneath the keyboard when it is opening
  SystemUI.setBackgroundColorAsync(isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50]);

  // Initialize ad service on app start
  useEffect(() => {
    const initAds = async () => {
      try {
        // Default test mode to true unless EXPO_PUBLIC_ADS_TEST_MODE is explicitly set to false
        const isTestMode = !(process.env.EXPO_PUBLIC_ADS_TEST_MODE === "false");
        await adService.initialize({
          testMode: isTestMode, // Set to false in production
          // Production ad unit IDs
          androidAppId: "ca-app-pub-4419810431864546/9303348400",
          iosAppId: "ca-app-pub-3940256099942544/3986624511",
        });
      } catch (error) {
        console.error("Failed to initialize ads:", error);
      }
    };

    initAds();
  }, []);

  return (
    <GestureHandlerRootView>
      <AuthUserContextProvider>
        <AuthProfileContextProvider>
          <ColorModeContextProvider>
            <AdsConfigProvider>
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
                    <Stack.Screen name="auth" options={{ title: "", headerShown: false, animation: "default" }} />
                    <Stack.Screen name="onboarding" options={{ title: "", headerShown: false }} />
                    <Stack.Screen name="(app)" options={{ title: "Home", headerShown: false, animation: "fade" }} />
                  </Stack>
                  <Toast config={toastConfig} />
                </BottomSheetModalProvider>
              </AuthInterceptor>
            </AdsConfigProvider>
          </ColorModeContextProvider>
        </AuthProfileContextProvider>
      </AuthUserContextProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
