import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Platform } from "react-native";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  handleBackButtonPress: () => void;
  toggleFlash: () => void;
  flash: string;
  toggleCameraFacing: () => void;
};

const CameraHeader = ({ handleBackButtonPress, toggleFlash, flash, toggleCameraFacing }: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  return (
    <View
      style={[
        s.topContainer,
        {
          height: (screenHeight - screenWidth) / 2,
        },
      ]}
    >
      <View style={[s.topIconContainer, { marginTop: Platform.OS === "ios" ? insets.top + 24 : 12 + 24 }]}>
        <TouchableOpacity onPress={handleBackButtonPress}>
          <AntDesign name="close" size={28} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFlash} hitSlop={10}>
          <Ionicons
            name={flash === "on" ? "flash" : "flash-off"}
            size={24}
            color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleCameraFacing} hitSlop={10}>
          <MaterialIcons name="flip-camera-ios" size={30} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])} />
        </TouchableOpacity>
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
