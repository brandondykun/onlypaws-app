import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { View, Pressable, Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { PostDetailed } from "@/types";

type Props = {
  post: PostDetailed;
  index: number;
  onPress: (index: number) => void;
};

const NUM_COLUMNS = 3;
const GAP_SIZE = 1;

const PostTile = ({ post, index, onPress }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  // calculate available space horizontally on screen for images minus the gap pixels
  const availableSpace = screenWidth - (NUM_COLUMNS - 1) * GAP_SIZE;
  // calculate image size considering the pixels removed from the gap pixels
  const itemSize = availableSpace / NUM_COLUMNS;
  const isRightColumnImage = (index - 2) % 3 === 0;
  // make right column image one pixel wider to avoid single pixel gap along right edge
  const width = isRightColumnImage ? itemSize + 1 : itemSize;

  return (
    <View style={{ position: "relative" }}>
      {post.images.length > 1 ? (
        <View style={{ position: "absolute", top: 3, right: 3, zIndex: 2 }}>
          <MaterialCommunityIcons name="card-multiple" size={16} color={COLORS.zinc[50]} />
        </View>
      ) : null}
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        onPress={() => onPress(index)}
        testID={`post-tile-pressable-${post.id}`}
      >
        <Image source={{ uri: post.images[0].image }} style={{ height: itemSize, width: width }} />
      </Pressable>
    </View>
  );
};

export default PostTile;
