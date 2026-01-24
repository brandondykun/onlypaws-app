import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

const FollowListHeader = ({ title }: { title: string }) => {
  return (
    <View style={s.root}>
      <Text style={s.text} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[600]}>
        {title}
      </Text>
    </View>
  );
};

export default FollowListHeader;

const s = StyleSheet.create({
  root: {
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    paddingLeft: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
