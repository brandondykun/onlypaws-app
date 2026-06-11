import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Canvas, ColorMatrix, Image as SkiaImage, useImage } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, GestureResponderEvent, ImageStyle, Pressable, StyleProp, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import PostImageSkeleton from "@/shared/components/LoadingSkeletons/PostImageSkeleton";

// Deuteranopia approximation — collapses reds/greens toward blue/yellow
const DOG_VISION_MATRIX = [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0];
const IMAGE_CACHE_POLICY = "memory-disk";
// The app is portrait-locked, so the screen width never changes at runtime. Reading it once
// avoids subscribing every feed cell to dimension-change events via useWindowDimensions.
const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  uri: string;
  blurhash?: string | null;
  width?: number;
  height?: number;
  dogVision?: boolean;
  dogVisionToggleEnabled?: boolean;
  onDogVisionReady?: () => void;
  onDogVisionToggle?: (active: boolean) => void;
  onPress?: (e: GestureResponderEvent) => void;
  setShowTagPopovers?: React.Dispatch<React.SetStateAction<boolean>>;
  style?: StyleProp<ImageStyle>;
};

type DogVisionOverlayProps = {
  uri: string;
  width: number;
  height: number;
  onReady?: () => void;
};

const DogVisionOverlay = ({ uri, width, height, onReady }: DogVisionOverlayProps) => {
  const skiaImage = useImage(uri);

  useEffect(() => {
    if (!skiaImage) return;

    // Let the Canvas commit before the parent starts any overlay animations. The first Skia mount can otherwise
    // compete with the Dog Vision pill entrance and drop a frame.
    const frame = requestAnimationFrame(() => {
      onReady?.();
    });

    return () => cancelAnimationFrame(frame);
  }, [onReady, skiaImage]);

  if (!skiaImage) return null;

  return (
    <Canvas style={[s.dogVisionOverlay, { width, height }]}>
      <SkiaImage image={skiaImage} x={0} y={0} width={width} height={height} fit="cover">
        <ColorMatrix matrix={DOG_VISION_MATRIX} />
      </SkiaImage>
    </Canvas>
  );
};

const ImageLoader = ({
  uri,
  blurhash,
  width,
  height,
  dogVision = false,
  dogVisionToggleEnabled = true,
  onDogVisionReady,
  onDogVisionToggle,
  onPress,
  setShowTagPopovers,
  style,
}: Props) => {
  const [loading, setLoading] = useState(true);

  // Dog Vision is tracked locally so non-post usages can still opt into the filter independently.
  const [dogVisionActive, setDogVisionActive] = useState(dogVision);

  const displayWidth = width ?? SCREEN_WIDTH;
  const displayHeight = height ?? SCREEN_WIDTH;

  // Reset the loading skeleton when recycled list cells receive a new image URI.
  useEffect(() => {
    setLoading(true);
  }, [uri]);

  // Keep the local toggle in sync when the optional controlled default changes or a recycled cell gets a new image.
  useEffect(() => {
    setDogVisionActive(dogVision);
  }, [dogVision, uri]);

  // Long press toggles the requested Dog Vision state and gives immediate tactile confirmation.
  const handleLongPress = useCallback(() => {
    setShowTagPopovers?.(false);
    const nextDogVisionActive = !dogVisionActive;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setDogVisionActive(nextDogVisionActive);
    onDogVisionToggle?.(nextDogVisionActive);
  }, [dogVisionActive, onDogVisionToggle, setShowTagPopovers]);

  const showSkeleton = loading && !blurhash;
  const placeholder = useMemo(() => (blurhash ? { blurhash } : undefined), [blurhash]);
  const imageSizeStyle = useMemo(() => ({ width: displayWidth, height: displayHeight }), [displayHeight, displayWidth]);

  // Gesture handler fires when long press is recognized, instead of waiting for finger lift.
  const longPressGesture = useMemo(
    () =>
      Gesture.LongPress()
        .enabled(dogVisionToggleEnabled)
        .runOnJS(true)
        .onStart(() => {
          handleLongPress();
        }),
    [dogVisionToggleEnabled, handleLongPress],
  );

  // Keep the regular image mounted as the base layer so toggling dog vision never flashes blank.
  const image = (
    <Zoomable onInteractionStart={() => setShowTagPopovers?.(false)}>
      <View style={imageSizeStyle}>
        <Image
          source={{ uri }}
          placeholder={placeholder}
          placeholderContentFit="cover"
          style={[imageSizeStyle, style]}
          cachePolicy={IMAGE_CACHE_POLICY}
          recyclingKey={uri}
          onLoadEnd={() => setLoading(false)}
        />
        {dogVisionActive ? (
          <DogVisionOverlay uri={uri} width={displayWidth} height={displayHeight} onReady={onDogVisionReady} />
        ) : null}
      </View>
    </Zoomable>
  );

  return (
    <View style={[imageSizeStyle, s.root]}>
      <GestureDetector gesture={longPressGesture}>
        {onPress ? (
          <Pressable onPress={onPress} style={imageSizeStyle}>
            {image}
          </Pressable>
        ) : (
          <View style={imageSizeStyle}>{image}</View>
        )}
      </GestureDetector>

      {showSkeleton ? (
        <View pointerEvents="none" style={s.skeletonOverlay}>
          <PostImageSkeleton />
        </View>
      ) : null}
    </View>
  );
};

export default memo(ImageLoader);

const s = StyleSheet.create({
  root: {
    position: "relative",
  },
  dogVisionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
