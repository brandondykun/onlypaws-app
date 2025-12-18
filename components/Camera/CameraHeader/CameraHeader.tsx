import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ImageAspectRatio } from "@/types/post/post";

import AspectRatioToggle from "./AspectRatioToggle";

type Props = {
  handleBackButtonPress: () => void;
  toggleFlash: () => void;
  flash: string;
  toggleCameraFacing: () => void;
  setAspectRatio?: (aspectRatio: ImageAspectRatio) => void;
  aspectRatio?: ImageAspectRatio;
  showAspectRatioToggle?: boolean;
};

const CameraHeader = ({
  handleBackButtonPress,
  toggleFlash,
  flash,
  toggleCameraFacing,
  setAspectRatio,
  aspectRatio = "1:1",
  showAspectRatioToggle = true,
}: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  let marginTop = Platform.OS === "ios" ? insets.top + 24 : 12 + 24;

  if (!showAspectRatioToggle) {
    // if the aspect ratio toggle is not shown, we need to add 12px to the margin top
    // to account for the missing height from the toggle button.
    marginTop += 12;
  }

  return (
    <View
      style={[
        s.topContainer,
        {
          height: (screenHeight - screenWidth) / 2,
        },
      ]}
    >
      <View style={[s.topIconContainer, { marginTop: marginTop }]}>
        <Pressable onPress={handleBackButtonPress} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <AntDesign name="close" size={24} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[100])} />
        </Pressable>
        <Pressable onPress={toggleFlash} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons
            name={flash === "on" ? "flash" : "flash-off"}
            size={20}
            color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[100])}
          />
        </Pressable>
        {showAspectRatioToggle ? <AspectRatioToggle aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} /> : null}

        <Pressable onPress={toggleCameraFacing} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <MaterialIcons name="flip-camera-ios" size={24} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[100])} />
        </Pressable>
      </View>
    </View>
  );
};

export default CameraHeader;

const s = StyleSheet.create({
  topContainer: {
    flex: 1,
    zIndex: 3,
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  topIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
  },
});
