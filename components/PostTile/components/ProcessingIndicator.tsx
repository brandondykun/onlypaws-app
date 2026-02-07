import { ActivityIndicator, StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { PostStatus } from "@/types";

type Props = {
  postStatus: PostStatus;
};

const ProcessingIndicator = ({ postStatus }: Props) => {
  if (postStatus !== "PROCESSING") return null;

  return (
    <View style={s.root}>
      <View style={s.content}>
        <ActivityIndicator color={COLORS.zinc[400]} size="small" />
        <Text style={s.text} darkColor={COLORS.zinc[400]} lightColor={COLORS.sky[400]}>
          PROCESSING
        </Text>
      </View>
    </View>
  );
};

export default ProcessingIndicator;

const s = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    gap: 4,
  },
  text: {
    fontSize: 8,
  },
});
