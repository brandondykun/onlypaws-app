import { ImagePickerAsset } from "expo-image-picker";
import { useState } from "react";
import { StyleProp, ImageStyle, View, StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PagerView, { PagerViewProps } from "react-native-pager-view";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { PostImage } from "@/types";

import ImageLoader from "../ImageLoader/ImageLoader";

type Props = {
  images: PostImage[] | (PhotoFile | ImagePickerAsset)[];
  imageHeight: number;
  imageWidth: number;
  imageStyle?: StyleProp<ImageStyle>;
} & PagerViewProps;

const ImageSwiper = ({ images, imageHeight, imageWidth, imageStyle, ...rest }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const imageCount = images.length;

  const getImageUri = (image: PhotoFile | ImagePickerAsset | PostImage) => {
    if ("uri" in image) {
      return image.uri;
    } else if ("path" in image) {
      if (Platform.OS === "android") {
        return `file://${image.path}`;
      }
      return image.path;
    } else {
      return image.image;
    }
  };

  return (
    <View>
      <PagerView
        {...rest}
        initialPage={currentPage}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position);
        }}
        style={imageStyle}
      >
        {images.map((image, i) => {
          return (
            <GestureHandlerRootView key={i}>
              <ImageLoader uri={getImageUri(image)} height={imageHeight} width={imageWidth} style={imageStyle} />
            </GestureHandlerRootView>
          );
        })}
      </PagerView>

      <View style={s.imageCountIconsContainer}>
        {imageCount > 1
          ? images.map((image, i) => {
              return (
                <View
                  style={{
                    height: 8,
                    width: 8,
                    backgroundColor: i === currentPage ? COLORS.sky[500] : COLORS.zinc[500],
                    opacity: i === currentPage ? 1 : 0.8,
                    borderRadius: 25,
                  }}
                  key={i}
                />
              );
            })
          : null}
      </View>
    </View>
  );
};

export default ImageSwiper;

const s = StyleSheet.create({
  imageCountIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 4,
    height: 18,
  },
});
