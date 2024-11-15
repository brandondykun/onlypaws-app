import { Pressable, View } from "react-native";
import ViewMoreText from "react-native-view-more-text";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

type Props = {
  caption: string;
};

const PostCaption = ({ caption }: Props) => {
  return (
    <View style={{ paddingHorizontal: 8, paddingTop: 18 }}>
      <ViewMoreText
        numberOfLines={1}
        renderViewMore={(onPress) => (
          <Pressable onPress={onPress} hitSlop={15} style={{ width: 80 }}>
            <Text style={{ color: COLORS.zinc[500] }}>view more</Text>
          </Pressable>
        )}
        renderViewLess={(onPress) => (
          <Pressable onPress={onPress} hitSlop={15} style={{ width: 80 }}>
            <Text style={{ color: COLORS.zinc[500] }}>view less</Text>
          </Pressable>
        )}
      >
        <Text>{caption}</Text>
      </ViewMoreText>
    </View>
  );
};

export default PostCaption;
