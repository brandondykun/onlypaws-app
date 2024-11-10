import { StyleSheet, View, Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";

const CameraBackground = () => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={s.root} pointerEvents="none">
      {/* Top */}
      <View style={s.top}></View>

      {/* Camera Square */}
      <View style={[s.middle, { height: screenWidth, width: screenWidth }]} pointerEvents="none" />

      {/* Bottom */}
      <View style={s.bottom}></View>
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
    backgroundColor: COLORS.zinc[950],
  },
  middle: {
    borderWidth: 1,
    borderColor: COLORS.zinc[950],
  },
  bottom: {
    flex: 1,
    backgroundColor: COLORS.zinc[950],
    justifyContent: "center",
  },
});
