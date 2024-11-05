import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { useState } from "react";
import { StyleProp, ImageStyle, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PagerView, { PagerViewProps } from "react-native-pager-view";

import { COLORS } from "@/constants/Colors";
import { PostImage } from "@/types";

import ImageLoader from "../ImageLoader/ImageLoader";

type Props = {
  images: PostImage[];
  imageHeight: number;
  imageWidth: number;
  imageStyle?: StyleProp<ImageStyle>;
} & PagerViewProps;

const ImageSwiper = ({ images, imageHeight, imageWidth, imageStyle, ...rest }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const imageCount = images.length;

  return (
    <View>
      <PagerView
        {...rest}
        initialPage={currentPage}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position);
        }}
      >
        {images.map((image, i) => {
          return (
            <GestureHandlerRootView key={i}>
              <Zoomable>
                <ImageLoader uri={image.image} height={imageHeight} width={imageWidth} style={imageStyle} />
              </Zoomable>
            </GestureHandlerRootView>
          );
        })}
      </PagerView>
      {imageCount > 1 ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            paddingTop: 12,
          }}
        >
          {images.map((image, i) => {
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
          })}
        </View>
      ) : null}
    </View>
  );
};

export default ImageSwiper;
