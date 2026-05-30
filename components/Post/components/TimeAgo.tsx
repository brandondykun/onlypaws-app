import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import Text from "@/shared/ui/Text/Text";
import { getTimeSince } from "@/utils/utils";

type Props = {
  createdAt: string;
};

const TimeAgo = ({ createdAt }: Props) => {
  return (
    <View style={s.root}>
      <Text darkColor={COLORS.zinc[500]} style={s.text}>
        {getTimeSince(createdAt)}
      </Text>
    </View>
  );
};

export default TimeAgo;

const s = StyleSheet.create({
  root: {
    paddingTop: 6,
  },
  text: {
    fontSize: 13,
  },
});
