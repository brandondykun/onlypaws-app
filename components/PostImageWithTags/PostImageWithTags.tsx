import { GestureResponderEvent, StyleSheet, useWindowDimensions, View } from "react-native";

import ImageLoader from "@/shared/components/ImageLoader/ImageLoader";
import { PostImage } from "@/types";
import { ImageAspectRatio, ImageAssetWithTags } from "@/types/post/post";
import { getImageHeightAspectAware, getImageUri } from "@/utils/utils";

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
      dogVision?: boolean;
      onDogVisionReady?: () => void;
      onDogVisionToggle?: (active: boolean) => void;
    }
  | {
      item: PostImage | ImageAssetWithTags;
      handleCoordinatesPress?: undefined;
      showTagPopovers: boolean;
      setShowTagPopovers: React.Dispatch<React.SetStateAction<boolean>>;
      onTagsButtonPress?: () => void;
      aspectRatio?: ImageAspectRatio;
      dogVision?: boolean;
      onDogVisionReady?: () => void;
      onDogVisionToggle?: (active: boolean) => void;
    };

const PostImageWithTags = ({
  item,
  handleCoordinatesPress,
  showTagPopovers,
  setShowTagPopovers,
  onTagsButtonPress,
  aspectRatio = "1:1",
  dogVision = false,
  onDogVisionReady,
  onDogVisionToggle,
}: Props) => {
  const { width } = useWindowDimensions();
  const tagsToDisplay = item.tags;
  const hasTags = tagsToDisplay.length > 0;
  const imageUri = getImageUri(item) ?? "";

  if (!handleCoordinatesPress) {
    return (
      <View style={{ position: "relative", zIndex: 50 }}>
        <ImageLoader
          uri={imageUri}
          width={width}
          height={getImageHeightAspectAware(width, aspectRatio)}
          style={s.image}
          setShowTagPopovers={setShowTagPopovers}
          dogVision={dogVision}
          onDogVisionReady={onDogVisionReady}
          onDogVisionToggle={onDogVisionToggle}
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
                key={`${imageUri}-${tag.tagged_profile.id}`}
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
    <View style={{ position: "relative" }}>
      <ImageLoader
        uri={imageUri}
        width={width}
        height={getImageHeightAspectAware(width, aspectRatio)}
        style={s.image}
        setShowTagPopovers={setShowTagPopovers}
        onPress={handleCoordinatesPress}
        dogVision={dogVision}
        onDogVisionReady={onDogVisionReady}
        onDogVisionToggle={onDogVisionToggle}
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
          key={`${imageUri}-${tag.tagged_profile.id}`}
          tag={tag}
          visible={showTagPopovers}
          setVisible={setShowTagPopovers}
          aspectRatio={aspectRatio}
        />
      ))}
    </View>
  );
};

export default PostImageWithTags;

const s = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
});
