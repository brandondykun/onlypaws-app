import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, ActivityIndicator } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const TabLayout = () => {
  const { isDarkMode } = useColorMode();

  const { authLoading, isAuthenticated, user } = useAuthUserContext();

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  }
  if (isAuthenticated && user.is_email_verified) {
    return <Redirect href="/(app)/(index)" />;
  }

  return (
    <>
      <StatusBar style="auto" />
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
        <Stack.Screen name="forgotPassword" options={{ title: "Forgot Password" }} />
        <Stack.Screen name="resetPassword" options={{ title: "Reset Password" }} />
      </Stack>
    </>
  );
};

export default TabLayout;
