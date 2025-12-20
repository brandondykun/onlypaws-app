import { View, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { getTimeSince } from "@/utils/utils";

type Props = {
  title: string;
  createdAt: string;
};

const Description = ({ title, createdAt }: Props) => {
  return (
    <View style={s.root}>
      <View>
        <Text style={s.title} numberOfLines={1} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[950]}>
          {title}
        </Text>
      </View>
      <View>
        <Text darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
          {getTimeSince(createdAt)}
        </Text>
      </View>
    </View>
  );
};

export default Description;

const s = StyleSheet.create({
  root: {
    gap: 6,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 15,
    fontWeight: "400",
    wordWrap: "nowrap",
  },
});
