import { useRef } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { PanGesture } from "react-native-gesture-handler";
import { Extrapolation, interpolate, useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostImage } from "@/types";
import { ImageAsset, ImageAssetWithTags } from "@/types/post/post";

import PostImageWithTags from "../PostImageWithTags/PostImageWithTags";

type Props =
  | {
      images: PostImage[] | ImageAssetWithTags[];
      renderItem: (info: { item: PostImage | ImageAssetWithTags; index: number }) => React.ReactElement;
      onIndexChange?: (index: number) => void;
      showTagPopovers?: undefined;
      setShowTagPopovers?: undefined;
      onTagsButtonPress?: undefined;
    }
  | {
      images: PostImage[] | ImageAssetWithTags[];
      renderItem?: undefined;
      onIndexChange?: (index: number) => void;
      showTagPopovers: boolean;
      setShowTagPopovers: React.Dispatch<React.SetStateAction<boolean>>;
      onTagsButtonPress?: () => void;
    };

// Basic pagination example if custom pagination causes issues
// <Pagination.Basic
//   progress={progress}
//   data={images as ImageAsset[]}
//   dotStyle={{ backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[500]), borderRadius: 50 }}
//   containerStyle={{ gap: 5 }}
//   activeDotStyle={{ backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[600]), borderRadius: 50 }}
// />

const ImageSwiper = ({
  images,
  renderItem,
  onIndexChange,
  showTagPopovers,
  setShowTagPopovers,
  onTagsButtonPress,
}: Props) => {
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const { setLightOrDark } = useColorMode();
  const width = useWindowDimensions().width;

  console.log("RERENDERED IMAGE SWIPER");

  return (
    <View style={{ width: width }}>
      <Carousel<PostImage | ImageAssetWithTags>
        key={images[0]?.id}
        ref={ref}
        width={width}
        height={width}
        data={images}
        onProgressChange={progress}
        renderItem={({ item, index }) => {
          if (renderItem) {
            return renderItem({ item, index });
          }
          return (
            <PostImageWithTags
              item={item}
              showTagPopovers={showTagPopovers}
              setShowTagPopovers={setShowTagPopovers!}
              onTagsButtonPress={onTagsButtonPress}
            />
          );
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
        onSnapToItem={onIndexChange}
      />
      <View style={styles.paginationContainer}>
        {images.length > 1 && (
          <Pagination.Custom<PostImage | ImageAsset | ImageAssetWithTags>
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

const styles = StyleSheet.create({
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
