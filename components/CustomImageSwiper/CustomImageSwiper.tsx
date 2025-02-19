import { ImagePickerAsset } from "expo-image-picker";
import React, { useRef } from "react";
import { View, FlatList, StyleSheet, Dimensions, Platform } from "react-native";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useList } from "@/hooks/useListIndex";
import { PostImage } from "@/types";

import ImageLoader from "../ImageLoader/ImageLoader";
const WINDOW_WIDTH = Dimensions.get("window").width;

type Props = {
  images: PostImage[] | (PhotoFile | ImagePickerAsset)[];
};

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

const CustomImageSwiper = ({ images }: Props) => {
  const flatListRef = useRef<FlatList>(null);
  const { pageIndex, indexController } = useList({ ref: flatListRef });

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.imageContainer}>
              <ImageLoader uri={getImageUri(item)} height={WINDOW_WIDTH} width={WINDOW_WIDTH} style={styles.image} />
            </View>
          );
        }}
        horizontal
        pagingEnabled
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        snapToInterval={WINDOW_WIDTH}
        snapToAlignment="center"
        decelerationRate={"fast"}
        bounces={images.length > 1 ? true : false}
        keyExtractor={(_, index) => index.toString()}
        {...indexController}
      />
      <View style={styles.paginationContainer}>
        {images.length > 1
          ? images.map((_, i) => (
              <View
                style={{
                  height: 8,
                  width: 8,
                  backgroundColor: i === pageIndex ? COLORS.sky[500] : COLORS.zinc[500],
                  opacity: i === pageIndex ? 1 : 0.8,
                  borderRadius: 25,
                }}
                key={i}
              />
            ))
          : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: WINDOW_WIDTH,
    height: WINDOW_WIDTH,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 4,
    height: 18,
  },
});

export default CustomImageSwiper;
