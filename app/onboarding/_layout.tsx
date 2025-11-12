import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const OnboardingLayout = () => {
  const { isDarkMode } = useColorMode();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
        headerBackVisible: true,
        headerTintColor: isDarkMode ? COLORS.zinc[50] : COLORS.zinc[950],
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Create Your Profile",
          headerShown: true,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
};

export default OnboardingLayout;
