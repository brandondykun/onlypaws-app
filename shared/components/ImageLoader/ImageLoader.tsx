import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Canvas, ColorMatrix, Image as SkiaImage, useImage } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureResponderEvent, ImageStyle, Pressable, StyleProp, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import PostImageSkeleton from "@/shared/components/LoadingSkeletons/PostImageSkeleton";

// Deuteranopia approximation — collapses reds/greens toward blue/yellow
const DOG_VISION_MATRIX = [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0];

type Props = {
  uri: string;
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

const ImageLoader = ({
  uri,
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

  const { width: screenWidth } = useWindowDimensions();

  const displayWidth = width ?? screenWidth;
  const displayHeight = height ?? screenWidth;

  // Reset the loading skeleton when recycled list cells receive a new image URI.
  useEffect(() => {
    setLoading(true);
  }, [uri]);

  // Keep the local toggle in sync when the optional controlled default changes or a recycled cell gets a new image.
  useEffect(() => {
    setDogVisionActive(dogVision);
  }, [dogVision, uri]);

  // Only load the image into Skia when Dog Vision is requested. Until this resolves, the normal image remains visible.
  const skiaImage = useImage(dogVisionActive ? uri : null);

  useEffect(() => {
    if (!dogVisionActive || !skiaImage) return;

    // Let the Canvas commit before the parent starts any overlay animations. The first Skia mount can otherwise
    // compete with the Dog Vision pill entrance and drop a frame.
    const frame = requestAnimationFrame(() => {
      onDogVisionReady?.();
    });

    return () => cancelAnimationFrame(frame);
  }, [dogVisionActive, onDogVisionReady, skiaImage]);

  // Long press toggles the requested Dog Vision state and gives immediate tactile confirmation.
  const handleLongPress = useCallback(() => {
    setShowTagPopovers?.(false);
    const nextDogVisionActive = !dogVisionActive;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setDogVisionActive(nextDogVisionActive);
    onDogVisionToggle?.(nextDogVisionActive);
  }, [dogVisionActive, onDogVisionToggle, setShowTagPopovers]);

  const showSkeleton = loading;

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
      <View style={{ width: displayWidth, height: displayHeight }}>
        <Image
          source={{ uri }}
          style={[{ width: displayWidth, height: displayHeight }, style]}
          onLoadEnd={() => setLoading(false)}
        />
        {dogVisionActive && skiaImage ? (
          <Canvas
            style={[{ width: displayWidth, height: displayHeight, position: "absolute", top: 0, left: 0 }, style]}
          >
            <SkiaImage image={skiaImage} x={0} y={0} width={displayWidth} height={displayHeight} fit="cover">
              <ColorMatrix matrix={DOG_VISION_MATRIX} />
            </SkiaImage>
          </Canvas>
        ) : null}
      </View>
    </Zoomable>
  );

  return (
    <View style={{ width: displayWidth, height: displayHeight, position: "relative" }}>
      {showSkeleton ? <PostImageSkeleton /> : null}

      <GestureDetector gesture={longPressGesture}>
        {onPress ? (
          <Pressable onPress={onPress} style={{ width: displayWidth, height: displayHeight }}>
            {image}
          </Pressable>
        ) : (
          <View style={{ width: displayWidth, height: displayHeight }}>{image}</View>
        )}
      </GestureDetector>
    </View>
  );
};

export default ImageLoader;
