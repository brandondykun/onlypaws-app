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

const PostTile = ({ post, index, onPress }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const isCenterRow = (index + 2) % 3 === 0;

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
        <Image
          source={{ uri: post.images[0].image }}
          style={{ height: screenWidth / 3 - 1, width: isCenterRow ? screenWidth / 3 : screenWidth / 3 - 1 }}
        />
      </Pressable>
    </View>
  );
};

export default PostTile;
