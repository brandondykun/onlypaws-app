import { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageHeightAspectAware } from "@/utils/utils";

type Props = {
  aspectRatio: "1:1" | "4:5";
};

const CameraBackground = ({ aspectRatio }: Props) => {
  const { setLightOrDark, isDarkMode } = useColorMode();
  const screenWidth = Dimensions.get("window").width;

  const targetHeight = getImageHeightAspectAware(screenWidth, aspectRatio);

  const animatedHeight = useSharedValue(targetHeight);

  useEffect(() => {
    animatedHeight.value = withTiming(targetHeight, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetHeight, animatedHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const overlayBg = {
    backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
    opacity: isDarkMode ? 0.6 : 0.5,
  };

  return (
    <View style={s.root} pointerEvents="none">
      {/* Top */}
      <View style={[s.top, overlayBg]} />

      {/* Camera Square */}
      <Animated.View
        style={[
          s.middle,
          animatedStyle,
          {
            width: screenWidth,
            borderColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[800]),
          },
        ]}
        pointerEvents="none"
      ></Animated.View>

      {/* Bottom */}
      <View style={[s.bottom, overlayBg]} />
    </View>
  );
};

export default CameraBackground;

const s = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  top: {
    flex: 1,
  },
  middle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  bottom: {
    flex: 1,
    justifyContent: "center",
  },
});
