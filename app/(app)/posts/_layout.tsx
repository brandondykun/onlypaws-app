import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import ProfileDetailsContextProvider from "@/context/ProfileDetailsContext";

const PostsStack = () => {
  const { isDarkMode } = useColorMode();

  return (
    <ProfileDetailsContextProvider>
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
        <Stack.Screen name="index" options={{ title: "Posts" }} />
        <Stack.Screen name="list" options={{ title: "Posts" }} />
        <Stack.Screen name="followers" options={{ title: "Followers", headerBackTitleVisible: false }} />
        <Stack.Screen name="following" options={{ title: "Following", headerBackTitleVisible: false }} />
      </Stack>
    </ProfileDetailsContextProvider>
  );
};

export default PostsStack;
