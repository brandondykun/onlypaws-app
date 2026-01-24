import { Stack } from "expo-router";

import { COLORS } from "@/constants/Colors";
import AddPostContextProvider from "@/context/AddPostContext";
import { useColorMode } from "@/context/ColorModeContext";

const AddStack = () => {
  const { setLightOrDark } = useColorMode();

  return (
    <AddPostContextProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
          headerTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[200]),
          contentStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Camera", headerShown: false }} />
        <Stack.Screen name="editImages" options={{ title: "Edit Images" }} />
        <Stack.Screen name="upload" options={{ title: "Add Post" }} />
      </Stack>
    </AddPostContextProvider>
  );
};

export default AddStack;
