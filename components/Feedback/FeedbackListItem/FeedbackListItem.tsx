import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { FeedbackTicket } from "@/types";

import Text from "../../Text/Text";
import FeedbackCard from "../FeedbackCard/FeedbackCard";
import FeedbackTypeBubble from "../FeedbackTypeBubble/FeedbackTypeBubble";

type Props = {
  item: FeedbackTicket;
};

const FeedbackListItem = ({ item }: Props) => {
  const { setLightOrDark } = useColorMode();

  const createdAt = new Date(item.created_at);
  return (
    <Pressable
      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
      onPress={() => router.push(`/(app)/profile/feedback/${item.id}`)}
    >
      <FeedbackCard style={{ marginBottom: 16 }}>
        <View style={s.headerContainer}>
          <Text numberOfLines={1} style={s.titleText}>
            {item.title}
          </Text>
          <Entypo name="chevron-small-right" size={28} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[200])} />
        </View>
        <View style={s.feedbackTypeContainer}>
          <FeedbackTypeBubble ticketType={item.ticket_type} />
        </View>
        <Text numberOfLines={2} style={s.description} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]}>
          {item.description}
        </Text>
        <Text style={s.dateText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Submitted on{" "}
          {createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </FeedbackCard>
    </Pressable>
  );
};

export default FeedbackListItem;

const s = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    maxWidth: "90%",
  },
  feedbackTypeContainer: {
    justifyContent: "flex-start",
    flexDirection: "row",
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
  },
  dateText: {
    fontSize: 15,
  },
});
