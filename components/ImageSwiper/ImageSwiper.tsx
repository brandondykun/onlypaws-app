import { ImagePickerAsset } from "expo-image-picker";
import { useRef } from "react";
import { View, Dimensions, StyleSheet, useWindowDimensions } from "react-native";
import { PanGesture } from "react-native-gesture-handler";
import { Image as CropperImage } from "react-native-image-crop-picker";
import { Extrapolation, interpolate, useSharedValue } from "react-native-reanimated";
import Carousel, { CarouselRenderItem, ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostImage } from "@/types";
import { getImageUri } from "@/utils/utils";

import ImageLoader from "../ImageLoader/ImageLoader";

type Props = {
  images: PostImage[] | (PhotoFile | ImagePickerAsset | CropperImage)[];
  renderItem?: CarouselRenderItem<PostImage | PhotoFile | ImagePickerAsset | CropperImage>;
};

// Basic pagination example if custom pagination causes issues
// <Pagination.Basic
//   progress={progress}
//   data={images as PhotoFile[]}
//   dotStyle={{ backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[500]), borderRadius: 50 }}
//   containerStyle={{ gap: 5 }}
//   activeDotStyle={{ backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[600]), borderRadius: 50 }}
// />

const ImageSwiper = ({ images, renderItem }: Props) => {
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const { setLightOrDark } = useColorMode();
  const width = useWindowDimensions().width;

  const defaultRenderItem = ({ item }: { item: PostImage | PhotoFile | ImagePickerAsset | CropperImage }) => {
    return <ImageLoader uri={getImageUri(item)} height={width} width={width} style={styles.image} />;
  };

  return (
    <View style={{ width: width }}>
      <Carousel<PostImage | PhotoFile | ImagePickerAsset | CropperImage>
        ref={ref}
        width={width}
        height={width}
        data={images}
        onProgressChange={progress}
        renderItem={(info) => {
          return renderItem ? renderItem(info) : defaultRenderItem({ item: info.item });
        }}
        loop={false}
        onConfigurePanGesture={(panGesture: PanGesture) => {
          // fix panGesture so that the carousel works correctly
          // within a ScrollView
          panGesture.config.touchAction = "pan-y"; // for web

          // for iOS and Android
          panGesture.activeOffsetX([-5, 5]);
          panGesture.failOffsetY([-5, 5]);
        }}
        overscrollEnabled={false}
        enabled={images.length > 1}
        scrollAnimationDuration={350}
      />
      <View style={styles.paginationContainer}>
        {images.length > 1 && (
          <Pagination.Custom<PostImage | PhotoFile | ImagePickerAsset | CropperImage>
            progress={progress}
            data={images}
            dotStyle={{
              borderRadius: 1,
              height: 6,
              width: 6,
              backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[500]),
            }}
            activeDotStyle={{
              borderRadius: 1,
              width: 8,
              height: 8,
              overflow: "hidden",
              backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[500]),
            }}
            containerStyle={styles.dotsContainer}
            horizontal
            customReanimatedStyle={(progress, index, length) => {
              let val = Math.abs(progress - index);
              if (index === 0 && progress > length - 1) {
                val = Math.abs(progress - length);
              }

              return {
                transform: [
                  {
                    translateY: interpolate(val, [0, 1], [0, 0], Extrapolation.CLAMP),
                  },
                ],
              };
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ImageSwiper;

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  image: {
    width: windowWidth,
    height: windowWidth,
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
  dotsContainer: {
    gap: 5,
    alignItems: "center",
  },
});
