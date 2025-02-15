import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const PostsStack = () => {
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
      <Stack.Screen name="index" options={{ title: "Posts" }} />
      <Stack.Screen name="list" options={{ title: "Posts", headerBackTitle: "My Posts" }} />
      <Stack.Screen name="followers" options={{ title: "Followers", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="following" options={{ title: "Following", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="savedPosts" options={{ title: "Saved", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="savedPostsList" options={{ title: "Saved", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="profileDetails" options={{ title: "Profile Details" }} />
      <Stack.Screen name="profilePostsList" options={{ title: "Posts" }} />
    </Stack>
  );
};

export default PostsStack;
