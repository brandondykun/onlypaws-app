import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../../Text/Text";

type Props = {
  followsYou: boolean;
  isFollowing: boolean;
};

const FollowIndicator = ({ followsYou, isFollowing }: Props) => {
  const { isDarkMode } = useColorMode();

  const backgroundColor = isDarkMode ? COLORS.sky[975] : COLORS.zinc[50];
  const borderColor = isDarkMode ? COLORS.sky[800] : COLORS.zinc[200];
  const textColor = isDarkMode ? COLORS.sky[50] : COLORS.zinc[950];
  const iconColor = isDarkMode ? COLORS.sky[400] : COLORS.zinc[950];

  if (followsYou && isFollowing) {
    return (
      <View style={{ ...s.root, backgroundColor, borderColor }}>
        <Ionicons name="checkmark-done-circle-sharp" size={12} color={iconColor} />
        <Text style={{ ...s.text, color: textColor }}>Mutual follow</Text>
      </View>
    );
  }

  if (followsYou) {
    return (
      <View style={{ ...s.root, backgroundColor, borderColor }}>
        <Ionicons name="checkmark-circle-sharp" size={12} color={iconColor} />
        <Text style={{ ...s.text, color: textColor }}>Follows you</Text>
      </View>
    );
  }

  return null;
};

export default FollowIndicator;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    borderWidth: 1,
    marginLeft: -4,
    marginTop: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
