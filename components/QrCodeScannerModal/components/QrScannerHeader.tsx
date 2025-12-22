import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  handleBackButtonPress: () => void;
  toggleCameraFacing: () => void;
};

const QrScannerHeader = ({ handleBackButtonPress, toggleCameraFacing }: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  let marginTop = Platform.OS === "ios" ? insets.top + 24 : 12 + 24;

  return (
    <View style={{ ...s.root, height: (screenHeight - screenWidth) / 2 }}>
      <View style={{ ...s.iconContainer, marginTop: marginTop }}>
        <Pressable onPress={handleBackButtonPress} hitSlop={10} style={({ pressed }) => [pressed && s.pressed]}>
          <AntDesign name="close" size={24} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[100])} />
        </Pressable>

        <Pressable onPress={toggleCameraFacing} hitSlop={10} style={({ pressed }) => [pressed && s.pressed]}>
          <MaterialIcons name="flip-camera-ios" size={24} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[100])} />
        </Pressable>
      </View>
      <View style={s.titleContainer}>
        <Text style={s.titleText}>Scan a friend's QR code</Text>
        <Text style={s.subTitleText} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[900]}>
          Place the QR Code inside the square below
        </Text>
      </View>
    </View>
  );
};

export default QrScannerHeader;

const s = StyleSheet.create({
  root: {
    flex: 1,
    zIndex: 3,
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleContainer: {
    marginTop: 48,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subTitleText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
