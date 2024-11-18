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
const GAP_SIZE = 3;

const PostTile = ({ post, index, onPress }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const availableSpace = screenWidth - (NUM_COLUMNS - 1) * GAP_SIZE;
  const itemSize = availableSpace / NUM_COLUMNS;

  return (
    <View style={{ position: "relative" }} key={post.id}>
      {post.images.length > 1 ? (
        <View style={{ position: "absolute", top: 3, right: 3, zIndex: 2 }}>
          <MaterialCommunityIcons name="card-multiple" size={16} color={COLORS.zinc[50]} />
        </View>
      ) : null}
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        onPress={() => onPress(index)}
        testID="post-tile-pressable"
      >
        <Image source={{ uri: post.images[0].image }} style={{ height: itemSize, width: itemSize }} />
      </Pressable>
    </View>
  );
};

export default PostTile;
