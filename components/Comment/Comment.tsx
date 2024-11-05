import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { PostCommentDetailed } from "@/types";

import Text from "../Text/Text";

type Props = {
  comment: PostCommentDetailed;
};
const Comment = ({ comment }: Props) => {
  return (
    <View key={comment.id} style={{ padding: 12 }}>
      <Text style={{ fontWeight: "600", marginBottom: 4, color: COLORS.zinc[500], fontSize: 12 }}>
        {comment.profile.username}
      </Text>
      <Text style={{ fontSize: 16 }}>{comment.text}</Text>
    </View>
  );
};

export default Comment;
