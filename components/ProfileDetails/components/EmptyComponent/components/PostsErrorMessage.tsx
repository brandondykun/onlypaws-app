import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const PostsErrorMessage = () => {
  const { setLightOrDark } = useColorMode();

  const backgroundColor = setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]);
  const iconColor = setLightOrDark(COLORS.zinc[700], COLORS.zinc[500]);

  return (
    <View style={{ ...s.errorContainer, backgroundColor: backgroundColor }}>
      <Ionicons name="alert-circle-outline" size={36} color={iconColor} />
      <Text style={s.errorText}>Error loading posts</Text>
      <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={s.errorInstructionsText}>
        Swipe down to refresh
      </Text>
      <Entypo name="chevron-thin-down" size={20} color={COLORS.zinc[500]} />
    </View>
  );
};

export default PostsErrorMessage;

const s = StyleSheet.create({
  errorContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 19,
    fontWeight: "400",
  },
  errorInstructionsText: {
    fontSize: 16,
    fontWeight: "300",
  },
});
