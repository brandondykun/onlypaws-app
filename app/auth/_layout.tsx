import { Redirect, Stack } from "expo-router";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import React from "react";
import { View, Text } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const TabLayout = () => {
  const { isDarkMode } = useColorMode();

  const { authLoading, isAuthenticated, user } = useAuthUserContext();

  if (authLoading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }
  if (isAuthenticated && user.is_email_verified) {
    return <Redirect href="/(app)/" />;
  }

  return (
    <>
      <ExpoStatusBar style="auto" />
      <Stack
        screenOptions={{
          title: "Welcome",
          headerShown: false,
          contentStyle: {
            backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Landing",
            headerStyle: {
              // backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerStyle: {
              backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
            },
          }}
        />
        <Stack.Screen
          name="verifyEmail"
          options={{
            title: "Verify Email",
            headerStyle: {
              backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
            },
          }}
        />
        <Stack.Screen name="register" options={{ title: "Register" }} />
      </Stack>
    </>
  );
};

export default TabLayout;
