import { GestureResponderEvent, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { PostImage } from "@/types";
import { ImageAspectRatio, ImageAssetWithTags } from "@/types/post/post";
import { getImageHeightAspectAware, getImageUri } from "@/utils/utils";

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
      aspectRatio?: ImageAspectRatio;
    }
  | {
      item: PostImage | ImageAssetWithTags;
      handleCoordinatesPress?: undefined;
      showTagPopovers: boolean;
      setShowTagPopovers: React.Dispatch<React.SetStateAction<boolean>>;
      onTagsButtonPress?: () => void;
      aspectRatio?: ImageAspectRatio;
    };

const PostImageWithTags = ({
  item,
  handleCoordinatesPress,
  showTagPopovers,
  setShowTagPopovers,
  onTagsButtonPress,
  aspectRatio = "1:1",
}: Props) => {
  const { width } = useWindowDimensions();
  const tagsToDisplay = item.tags;
  const hasTags = tagsToDisplay.length > 0;

  if (!handleCoordinatesPress) {
    return (
      <View style={{ position: "relative", zIndex: 50 }}>
        <ImageLoader
          uri={getImageUri(item)}
          width={width}
          height={getImageHeightAspectAware(width, aspectRatio)}
          style={s.image}
          setShowTagPopovers={setShowTagPopovers}
        />
        {hasTags && (
          <>
            <ShowTagsButton
              postId={item.id}
              showTagPopovers={showTagPopovers}
              setShowTagPopovers={setShowTagPopovers}
              onPress={onTagsButtonPress}
            />
            {tagsToDisplay.map((tag) => (
              <PopoverTag
                key={`${getImageUri(item)}-${tag.tagged_profile.id}`}
                tag={tag}
                visible={showTagPopovers}
                setVisible={setShowTagPopovers}
                aspectRatio={aspectRatio}
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
        width={width}
        height={getImageHeightAspectAware(width, aspectRatio)}
        style={s.image}
        setShowTagPopovers={setShowTagPopovers}
      />
      {tagsToDisplay.length > 0 && (
        <ShowTagsButton
          postId={item.id}
          showTagPopovers={showTagPopovers}
          setShowTagPopovers={setShowTagPopovers}
          onPress={onTagsButtonPress}
        />
      )}
      {tagsToDisplay.map((tag) => (
        <PopoverTag
          key={`${getImageUri(item)}-${tag.tagged_profile.id}`}
          tag={tag}
          visible={showTagPopovers}
          setVisible={setShowTagPopovers}
          aspectRatio={aspectRatio}
        />
      ))}
    </Pressable>
  );
};

export default PostImageWithTags;

const s = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
});
