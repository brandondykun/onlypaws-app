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
      initialRouteName="index"
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
      <Stack.Screen name="feedback/createFeedback" options={{ title: "New Feedback" }} />
      <Stack.Screen name="feedback/index" options={{ title: "Feedback" }} />
      <Stack.Screen name="feedback/[id]" options={{ title: "Details" }} />
      <Stack.Screen name="qrCode" options={{ title: "QR Code" }} />
      <Stack.Screen name="profileDetails" options={{ title: "Profile Details" }} />
      <Stack.Screen name="profilePostsList" options={{ title: "Posts" }} />
      <Stack.Screen name="taggedPosts" options={{ title: "Tagged Posts", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen
        name="taggedPostsList"
        options={{ title: "Tagged Posts", headerBackButtonDisplayMode: "minimal" }}
      />
      <Stack.Screen name="appDetails" options={{ title: "App Details" }} />
    </Stack>
  );
};

export default ProfileStack;
