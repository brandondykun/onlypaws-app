import { View } from "react-native";

import ReplyButton from "./ReplyButton";

type Props = {
  onReplyPress: () => void;
};

const MainCommentReplyButton = ({ onReplyPress }: Props) => {
  return (
    <View style={{ marginBottom: 3, paddingLeft: 12, alignItems: "flex-start" }}>
      <ReplyButton onReplyPress={onReplyPress} />
    </View>
  );
};

export default MainCommentReplyButton;
