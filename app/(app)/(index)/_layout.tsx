import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import FeedPostsContextProvider from "@/context/FeedPostsContext";
import ProfileDetailsContextProvider from "@/context/ProfileDetailsContext";

const FeedStack = () => {
  const { isDarkMode } = useColorMode();

  return (
    <FeedPostsContextProvider>
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
          <Stack.Screen name="index" options={{ title: "Feed" }} />
          <Stack.Screen name="profileDetails" options={{ title: "Profile Details" }} />
          <Stack.Screen name="profileList" options={{ title: "Posts" }} />
        </Stack>
      </ProfileDetailsContextProvider>
    </FeedPostsContextProvider>
  );
};

export default FeedStack;
