import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const ProfileErrorMessage = () => {
  const { isDarkMode } = useColorMode();

  return (
    <View
      style={[
        s.root,
        {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
      ]}
    >
      <Ionicons name="alert-circle-outline" size={36} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
      <Text style={s.mainText}>Error loading profile details</Text>
      <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={s.subText}>
        Swipe down to refresh
      </Text>
      <Entypo name="chevron-thin-down" size={20} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[500]} />
    </View>
  );
};

export default ProfileErrorMessage;

const s = StyleSheet.create({
  root: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  mainText: {
    fontSize: 19,
    fontWeight: "400",
  },
  subText: {
    fontSize: 16,
    fontWeight: "300",
  },
});
