import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { ImagePickerAsset } from "expo-image-picker";
import React, { useRef, useEffect, useCallback } from "react";
import { Dimensions, View, Pressable, StyleSheet, Animated } from "react-native";
import { Image as CropperImage } from "react-native-image-crop-picker";
import { useIsActive, useReorderableDrag } from "react-native-reorderable-list";
import { PhotoFile } from "react-native-vision-camera";

import ImageLoader from "@/components/ImageLoader/ImageLoader";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

type Props = {
  item: PhotoFile | ImagePickerAsset | CropperImage;
  index: number;
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset | CropperImage)[]>>;
};

const DraggableImage = ({ item, index, setImages }: Props) => {
  const { setLightOrDark } = useColorMode();

  const screenWidth = Dimensions.get("window").width;
  const scaleValue = useRef(new Animated.Value(0.7)).current;
  const opacityValue = useRef(new Animated.Value(0.5)).current;

  const drag = useReorderableDrag();
  const isActive = useIsActive();

  // handle removing image from list
  const handleRemove = (uri: string) => {
    Haptics.impactAsync();
    setImages((prev) => {
      return prev.filter((image) => {
        return getImageUri(image) !== uri;
      });
    });
  };

  // handle activate animation when item is dragged
  const handleActivate = useCallback(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleValue, opacityValue]);

  // handle deactivate animation when item is done being dragged
  const handleDeactivate = useCallback(() => {
    Animated.timing(scaleValue, {
      toValue: 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityValue, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleValue, opacityValue]);

  useEffect(() => {
    if (isActive) {
      handleActivate();
    } else {
      handleDeactivate();
    }
  }, [isActive, handleDeactivate, handleActivate]);

  const IMAGE_SIZE = screenWidth / 1.8;

  return (
    <Pressable onLongPress={drag} style={s.root}>
      <View style={s.indexContainer}>
        <Text darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]} style={s.indexText}>
          {index + 1}
        </Text>
      </View>
      <View style={s.imageContainer}>
        <Pressable style={s.removeButton} onPress={() => handleRemove(getImageUri(item))}>
          <Ionicons name="close-outline" size={24} color="black" />
        </Pressable>
        <ImageLoader uri={getImageUri(item)} width={IMAGE_SIZE} height={IMAGE_SIZE} />
      </View>
      <View style={s.swapIconContainer}>
        <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}>
          <Ionicons name="swap-vertical-sharp" size={30} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])} />
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default DraggableImage;

const s = StyleSheet.create({
  root: {
    marginBottom: 6,
    overflow: "hidden",
    alignItems: "center",
    flexDirection: "row",
  },
  indexContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  indexText: {
    fontSize: 20,
    fontWeight: "200",
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 12,
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: COLORS.zinc[100],
    borderRadius: 25,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  swapIconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
