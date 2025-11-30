import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { PostImage } from "@/types";
import { ImageAssetWithTags } from "@/types/post/post";
import { getImageUri } from "@/utils/utils";

import ImageLoader from "../ImageLoader/ImageLoader";

import PopoverTag from "./PopoverTag";
import ShowTagsButton from "./ShowTagsButton";

type Props =
  | {
      item: PostImage | ImageAssetWithTags;
      handleCoordinatesPress: (e: GestureResponderEvent) => void;
      showTagPopovers: boolean;
      setShowTagPopovers: React.Dispatch<React.SetStateAction<boolean>>;
      onTagsButtonPress?: () => void;
    }
  | {
      item: PostImage | ImageAssetWithTags;
      handleCoordinatesPress?: undefined;
      showTagPopovers: boolean;
      setShowTagPopovers: React.Dispatch<React.SetStateAction<boolean>>;
      onTagsButtonPress?: () => void;
    };

const PostImageWithTags = ({
  item,
  handleCoordinatesPress,
  showTagPopovers,
  setShowTagPopovers,
  onTagsButtonPress,
}: Props) => {
  const width = useWindowDimensions().width;
  const tagsToDisplay = item.tags;
  const hasTags = tagsToDisplay.length > 0;

  if (!handleCoordinatesPress) {
    return (
      <View style={{ position: "relative" }}>
        <ImageLoader
          uri={getImageUri(item)}
          height={width}
          width={width}
          style={s.image}
          setShowTagPopovers={setShowTagPopovers}
        />
        {hasTags && (
          <>
            <ShowTagsButton
              showTagPopovers={showTagPopovers}
              setShowTagPopovers={setShowTagPopovers}
              onPress={onTagsButtonPress}
            />
            {tagsToDisplay.map((tag) => (
              <PopoverTag
                key={`${getImageUri(item)}-${tag.tagged_profile.id}`}
                item={item}
                tag={tag}
                visible={showTagPopovers}
                setVisible={setShowTagPopovers}
              />
            ))}
          </>
        )}
      </View>
    );
  }

  return (
    <Pressable onPress={handleCoordinatesPress} style={{ position: "relative" }}>
      <ImageLoader
        uri={getImageUri(item)}
        height={width}
        width={width}
        style={s.image}
        setShowTagPopovers={setShowTagPopovers}
      />
      {tagsToDisplay.length > 0 && (
        <ShowTagsButton
          showTagPopovers={showTagPopovers}
          setShowTagPopovers={setShowTagPopovers}
          onPress={onTagsButtonPress}
        />
      )}
      {tagsToDisplay.map((tag) => (
        <PopoverTag
          key={`${getImageUri(item)}-${tag.tagged_profile.id}`}
          item={item}
          tag={tag}
          visible={showTagPopovers}
          setVisible={setShowTagPopovers}
        />
      ))}
    </Pressable>
  );
};

export default PostImageWithTags;

const windowWidth = Dimensions.get("window").width;

const s = StyleSheet.create({
  image: {
    width: windowWidth,
    height: windowWidth,
    resizeMode: "cover",
  },
});
