import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import ProfileSearchContextProvider from "@/context/ProfileSearchContext";

const ExploreStack = () => {
  const { isDarkMode } = useColorMode();

  return (
    <ProfileSearchContextProvider>
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
        <Stack.Screen name="index" options={{ title: "Explore" }} />
        <Stack.Screen name="profileSearch" options={{ title: "Search" }} />
        <Stack.Screen name="list" options={{ title: "Posts" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="profileList" options={{ title: "Posts" }} />
      </Stack>
    </ProfileSearchContextProvider>
  );
};

export default ExploreStack;
