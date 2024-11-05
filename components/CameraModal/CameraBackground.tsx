import { StyleSheet, View, Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";

const CameraBackground = () => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={s.root}>
      {/* Top */}
      <View style={s.top}></View>

      {/* Camera Square */}
      <View style={[s.middle, { height: screenWidth, width: screenWidth }]} />

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
  },
  top: {
    flex: 1,
    backgroundColor: COLORS.zinc[950],
    opacity: 0.9,
  },
  middle: {
    borderWidth: 1,
    borderColor: COLORS.zinc[950],
  },
  bottom: {
    flex: 1,
    backgroundColor: COLORS.zinc[950],
    opacity: 0.9,
    justifyContent: "center",
  },
});
