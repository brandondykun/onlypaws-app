import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";

import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import AuthProfileContextProvider from "@/context/AuthProfileContext";
import AuthUserContextProvider from "@/context/AuthUserContext";
import ColorModeContextProvider from "@/context/ColorModeContext";
import AuthInterceptor from "@/interceptors/AuthInterceptor";

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <AuthUserContextProvider>
      <AuthProfileContextProvider>
        <ColorModeContextProvider>
          <AuthInterceptor>
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
          </AuthInterceptor>
        </ColorModeContextProvider>
      </AuthProfileContextProvider>
    </AuthUserContextProvider>
  );
};

export default RootLayout;
