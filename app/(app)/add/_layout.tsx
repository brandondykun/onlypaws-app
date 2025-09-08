import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import AddPostContextProvider from "@/context/AddPostContext";
import { useColorMode } from "@/context/ColorModeContext";

const AddStack = () => {
  const { isDarkMode } = useColorMode();

  return (
    <AddPostContextProvider>
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
        initialRouteName="cameraScreen"
      >
        <Stack.Screen name="index" options={{ title: "Add Post" }} />
        <Stack.Screen name="editImages" options={{ title: "Edit Images" }} />
        <Stack.Screen name="cameraScreen" options={{ title: "Camera", headerShown: false }} />
      </Stack>
    </AddPostContextProvider>
  );
};

export default AddStack;
