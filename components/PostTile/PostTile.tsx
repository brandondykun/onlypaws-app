import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { View, Pressable, Dimensions, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PostDetailed } from "@/types";

import Text from "../Text/Text";

type Props = {
  post: PostDetailed;
  index: number;
  onPress: (index: number) => void;
};

const NUM_COLUMNS = 3;
const GAP_SIZE = 1;

const PostTile = ({ post, index, onPress }: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();

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
        {post.is_hidden && post.profile.id === authProfile.id ? (
          <View style={s.alertIconContainer} testID={`post-${post.id}-alert-icon`}>
            <View style={{ margin: -1 }}>
              <Ionicons name="alert-circle" size={16} color={COLORS.red[600]} />
            </View>
          </View>
        ) : null}
        {post.is_hidden && post.profile.id !== authProfile.id ? (
          <View
            style={[
              s.hiddenView,
              { height: itemSize, width: width, backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[400] },
            ]}
          >
            <Ionicons name="eye-off" size={34} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
            <Text darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]} style={s.hiddenText}>
              Hidden
            </Text>
          </View>
        ) : (
          <Image source={{ uri: post.images[0].image }} style={{ height: itemSize, width: width }} />
        )}
      </Pressable>
    </View>
  );
};

export default PostTile;

const s = StyleSheet.create({
  hiddenView: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  hiddenText: {
    fontWeight: 300,
    fontSize: 12,
  },
  alertIconContainer: {
    position: "absolute",
    top: 3,
    left: 3,
    zIndex: 10,
    backgroundColor: COLORS.zinc[950],
    borderRadius: 50,
  },
});
