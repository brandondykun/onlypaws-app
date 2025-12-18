import React from "react";
import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ImageAspectRatio } from "@/types/post/post";

import ToggleButton from "./AspectRatioToggleButton";

type Props = {
  aspectRatio: ImageAspectRatio;
  setAspectRatio: ((aspectRatio: ImageAspectRatio) => void) | undefined;
};

const AspectRatioToggle = ({ aspectRatio, setAspectRatio }: Props) => {
  const { setLightOrDark } = useColorMode();

  const bgColor = setLightOrDark(COLORS.zinc[100], COLORS.zinc[800]);
  const borderColor = setLightOrDark(COLORS.zinc[400], COLORS.zinc[700]);

  return (
    <View style={[{ backgroundColor: bgColor, borderColor: borderColor }, s.root]}>
      <ToggleButton
        buttonAspectRatio="1:1"
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        iconName="crop-square"
        iconSize={28}
      />
      <ToggleButton
        buttonAspectRatio="4:5"
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        iconName="crop-portrait"
        iconSize={28}
      />
    </View>
  );
};

export default AspectRatioToggle;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 25,
    overflow: "hidden",
    padding: 4,
    borderWidth: 1,
  },
});
