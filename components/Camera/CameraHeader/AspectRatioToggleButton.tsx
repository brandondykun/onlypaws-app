import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ImageAspectRatio } from "@/types/post/post";

type Props = {
  buttonAspectRatio: ImageAspectRatio;
  aspectRatio: ImageAspectRatio;
  setAspectRatio: ((aspectRatio: ImageAspectRatio) => void) | undefined;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconSize: number;
};

const ToggleButton = ({ buttonAspectRatio, aspectRatio, setAspectRatio, iconName, iconSize }: Props) => {
  const { setLightOrDark } = useColorMode();

  const isSelected = aspectRatio === buttonAspectRatio;

  const bgColor = isSelected ? setLightOrDark(COLORS.zinc[900], COLORS.zinc[100]) : "transparent";
  const borderColor = isSelected ? COLORS.zinc[700] : "transparent";

  const textColor = isSelected
    ? setLightOrDark(COLORS.zinc[100], COLORS.zinc[900])
    : setLightOrDark(COLORS.zinc[900], COLORS.zinc[100]);

  return (
    <Pressable
      onPress={() => setAspectRatio?.(buttonAspectRatio)}
      style={({ pressed }) => [
        s.rootPressable,
        pressed && { opacity: 0.6 },
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
      ]}
    >
      <View style={s.mainView}>
        <View style={s.textContainer}>
          <Text style={{ fontSize: 6, color: textColor }}>{buttonAspectRatio}</Text>
        </View>
        <MaterialCommunityIcons name={iconName} size={iconSize} color={textColor} />
      </View>
    </Pressable>
  );
};

export default ToggleButton;

const s = StyleSheet.create({
  rootPressable: {
    padding: 4,
    borderRadius: 25,
    borderWidth: 1,
  },
  mainView: {
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
