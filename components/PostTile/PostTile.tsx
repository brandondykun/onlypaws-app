import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { View, Pressable, Dimensions, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import Text from "@/shared/ui/Text/Text";
import { PostDetailed } from "@/types";

import ProcessingIndicator from "./components/ProcessingIndicator";

type Props = {
  post: PostDetailed;
  index: number;
  onPress: (index: number, post: PostDetailed) => void;
};

const NUM_COLUMNS = 3;
const GAP_SIZE = 1;

const PostTile = ({ post, index, onPress }: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();

  // Tile sizing only depends on the column index, so derive it once per index.
  const { itemSize, width } = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    // calculate available space horizontally on screen for images minus the gap pixels
    const availableSpace = screenWidth - (NUM_COLUMNS - 1) * GAP_SIZE;
    // calculate image size considering the pixels removed from the gap pixels
    const size = availableSpace / NUM_COLUMNS;
    const isRightColumnImage = (index - 2) % 3 === 0;
    // make right column image one pixel wider to avoid single pixel gap along right edge
    return { itemSize: size, width: isRightColumnImage ? size + 1 : size };
  }, [index]);

  // Use medium scaled image if available, otherwise fall back to original
  const imageUri = useMemo(() => {
    const mediumImage = post.images[0]?.scaled_images?.find((img) => img.scale === "medium");
    return mediumImage?.image || post.images[0]?.image || undefined;
  }, [post.images]);
  const blurhash = post.images[0]?.blurhash;
  const placeholder = useMemo(() => (blurhash ? { blurhash } : undefined), [blurhash]);
  const imageStyle = useMemo(() => ({ height: itemSize, width: width }), [itemSize, width]);

  return (
    <View style={{ position: "relative" }}>
      {post.images.length > 1 ? (
        <View style={{ position: "absolute", top: 3, right: 3, zIndex: 2 }}>
          <MaterialCommunityIcons name="card-multiple" size={16} color={COLORS.zinc[50]} />
        </View>
      ) : null}
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        onPress={() => onPress(index, post)}
        testID={`post-tile-pressable-${post.id}${post.is_hidden ? "-hidden" : ""}`}
      >
        {post.is_hidden && post.profile.id === authProfile.id ? (
          <View style={s.reportedIcon} testID={`post-${post.id}-reported-icon`}>
            <Ionicons name="alert-circle" size={22} color={COLORS.red[600]} style={{ margin: -3 }} />
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
          <>
            <Image
              source={{ uri: imageUri }}
              placeholder={placeholder}
              placeholderContentFit="cover"
              style={imageStyle}
              transition={0}
              cachePolicy="memory-disk"
              recyclingKey={imageUri}
            />
            <ProcessingIndicator postStatus={post.status} />
          </>
        )}
      </Pressable>
    </View>
  );
};

export default memo(PostTile);

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
  reportedIcon: {
    backgroundColor: COLORS.zinc[800],
    position: "absolute",
    top: 4,
    left: 4,
    zIndex: 10,
    borderRadius: 25,
  },
});
