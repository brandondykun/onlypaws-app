import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const ProfileStack = () => {
  const { isDarkMode } = useColorMode();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
        headerTintColor: isDarkMode ? COLORS.zinc[50] : COLORS.zinc[950],
        contentStyle: {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="add" options={{ title: "Add Profile" }} />
      <Stack.Screen name="guidelines" options={{ title: "" }} />
      <Stack.Screen name="about" options={{ title: "" }} />
      <Stack.Screen name="editProfile" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="editUsername" options={{ title: "Edit Username" }} />
      <Stack.Screen name="accountOptions" options={{ title: "Account" }} />
      <Stack.Screen name="changePassword" options={{ title: "Change Password" }} />
      <Stack.Screen name="changeEmail" options={{ title: "Change Email" }} />
      <Stack.Screen name="verifyEmail" options={{ title: "Verify Email" }} />
      <Stack.Screen name="deleteProfile" options={{ title: "Delete Profile" }} />
      <Stack.Screen name="profileImageCamera" options={{ title: "Profile Image Camera", headerShown: false }} />
    </Stack>
  );
};

export default ProfileStack;
