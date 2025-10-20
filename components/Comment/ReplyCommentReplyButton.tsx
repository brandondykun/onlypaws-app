import { View } from "react-native";

import ReplyButton from "./ReplyButton";

type Props = {
  onReplyPress: () => void;
};

const ReplyCommentReplyButton = ({ onReplyPress }: Props) => {
  return (
    <View style={{ paddingLeft: 28, alignItems: "flex-start" }}>
      <ReplyButton onReplyPress={onReplyPress} />
    </View>
  );
};

export default ReplyCommentReplyButton;
