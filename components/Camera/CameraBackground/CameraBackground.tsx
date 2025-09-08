import { StyleSheet, View, Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const CameraBackground = () => {
  const { setLightOrDark } = useColorMode();
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={s.root} pointerEvents="none">
      {/* Top */}
      <View style={[s.top, { backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]), opacity: 0.8 }]} />

      {/* Camera Square */}
      <View
        style={[
          s.middle,
          { height: screenWidth, width: screenWidth, borderColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[800]) },
        ]}
        pointerEvents="none"
      />

      {/* Bottom */}
      <View style={[s.bottom, { backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]), opacity: 0.8 }]} />
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
