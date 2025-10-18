import { StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { FeedbackTicketComment } from "@/types/feedback/feedback";

import Text from "../../Text/Text";
import FeedbackCard from "../FeedbackCard/FeedbackCard";

type Props = {
  comment: FeedbackTicketComment;
};

const FeedbackComment = ({ comment }: Props) => {
  const createdAt = new Date(comment.created_at);
  return (
    <FeedbackCard key={comment.id} style={{ marginBottom: 16 }}>
      <Text style={s.headerText}>OnlyPaws Dev Team</Text>
      <Text style={s.dateText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        Responded on{" "}
        {createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <Text style={s.commentText} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]}>
        {comment.content}
      </Text>
    </FeedbackCard>
  );
};

export default FeedbackComment;

const s = StyleSheet.create({
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 4,
  },
});
