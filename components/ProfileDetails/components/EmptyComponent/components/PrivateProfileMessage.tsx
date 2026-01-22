import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const PrivateProfileMessage = () => {
  const { setLightOrDark } = useColorMode();
  return (
    <View style={s.root}>
      <View style={{ ...s.iconContainer, borderColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[300]) }}>
        <Ionicons name="lock-closed-outline" size={56} color={setLightOrDark(COLORS.zinc[500], COLORS.zinc[200])} />
      </View>
      <Text style={s.primaryText} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[800]}>
        This profile is private
      </Text>
      <Text style={s.secondaryText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        Follow to see their posts.
      </Text>
    </View>
  );
};

export default PrivateProfileMessage;

const s = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    paddingTop: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    padding: 18,
    borderRadius: 100,
    borderWidth: 2,
    marginBottom: 24,
  },
  primaryText: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 18,
    textAlign: "center",
  },
});
