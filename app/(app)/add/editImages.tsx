import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { View, Dimensions, StyleSheet, ScrollView, Pressable, Animated } from "react-native";
import ImagePicker from "react-native-image-crop-picker";

import Button from "@/components/Button/Button";
import AspectRatioToggle from "@/components/Camera/CameraHeader/AspectRatioToggle";
import ReorderImageModal from "@/components/Camera/ReorderImageModal/ReorderImageModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAddPostContext } from "@/context/AddPostContext";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri, getImageHeightAspectAware } from "@/utils/utils";

// Animated Image Component with smooth scaling
const AnimatedImageWithScale = ({ source, style, pressed }: { source: any; style: any; pressed: boolean }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: pressed ? 0.95 : 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [pressed, scaleValue]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
      <Image source={source} style={style} />
    </Animated.View>
  );
};

const EditImages = () => {
  const { setLightOrDark } = useColorMode();
  const { images, setImages, aspectRatio, setAspectRatio } = useAddPostContext();

  const screenWidth = Dimensions.get("window").width;

  const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState(false);

  const handleRemove = (uri: string) => {
    setImages((prev) => prev.filter((image) => getImageUri(image) !== uri));
  };

  // if user removes all images, go back to camera screen
  useEffect(() => {
    if (images.length === 0) {
      router.back();
    }
  }, [images]);

  const handleImagePress = (imageId: string) => {
    // Find the current image to get its latest URI
    const imageToEdit = images.find((img) => img.id === imageId);
    if (!imageToEdit) return;

    const currentUri = getImageUri(imageToEdit);

    if (!currentUri) return;

    ImagePicker.openCropper({
      path: currentUri as string,
      width: 1080,
      height: aspectRatio === "4:5" ? 1340 : 1080,
      mediaType: "photo",
      compressImageQuality: 1,
    })
      .then((croppedImage) => {
        setImages((prev) => {
          return prev.map((img) => {
            if (img.id === imageId) {
              // Preserve id and tags from the original image
              return { ...croppedImage, id: img.id, tags: img.tags };
            }
            return img;
          });
        });
      })
      .catch((error) => {
        console.log("Crop Error: ", error);
      });
  };

  const imageHeight = getImageHeightAspectAware(screenWidth, aspectRatio);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: 24 }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, paddingTop: 54 }}>
        <Text style={s.tapText} lightColor={COLORS.zinc[900]} darkColor={COLORS.zinc[100]}>
          Tap to Crop
        </Text>
        {images.length > 1 ? (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 12,
              height: imageHeight * 0.8,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginTop: 24 }}
          >
            {images.map((image) => {
              return (
                <Pressable
                  style={[
                    s.imageContainer,
                    {
                      width: screenWidth * 0.8,
                      height: imageHeight * 0.8,
                    },
                  ]}
                  key={image.id}
                  onPress={() => handleImagePress(image.id)}
                >
                  {({ pressed }) => (
                    <>
                      <Pressable
                        style={s.removeButton}
                        onPress={() => {
                          const uri = getImageUri(image);
                          if (uri) handleRemove(uri);
                        }}
                      >
                        <Ionicons name="close-outline" size={20} color="black" />
                      </Pressable>
                      <AnimatedImageWithScale
                        source={{ uri: getImageUri(image) ?? "" }}
                        style={{
                          borderRadius: 6,
                          width: screenWidth * 0.8,
                          height: imageHeight * 0.8,
                        }}
                        pressed={pressed}
                      />
                    </>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : images.length === 1 ? (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 24 }}>
            <Pressable
              style={[
                s.imageContainer,
                {
                  width: screenWidth * 0.8,
                  height: imageHeight * 0.8,
                },
              ]}
              key={images[0].id}
              onPress={() => handleImagePress(images[0].id)}
            >
              {({ pressed }) => (
                <>
                  <Pressable
                    style={s.removeButton}
                    onPress={() => {
                      const uri = getImageUri(images[0]);
                      if (uri) handleRemove(uri);
                    }}
                  >
                    <Ionicons name="close-outline" size={20} color="black" />
                  </Pressable>
                  <AnimatedImageWithScale
                    source={{ uri: getImageUri(images[0]) ?? "" }}
                    style={{
                      borderRadius: 6,
                      width: screenWidth * 0.8,
                      height: imageHeight * 0.8,
                    }}
                    pressed={pressed}
                  />
                </>
              )}
            </Pressable>
          </View>
        ) : null}
        <View
          style={{
            padding: 16,
            justifyContent: "center",
            alignItems: "flex-end",
            paddingTop: 48,
            flexDirection: "row",
            gap: 6,
            flex: 1,
            paddingBottom: 48,
          }}
        >
          {images.length > 1 ? (
            <Pressable
              onPress={() => setImagePreviewModalVisible(true)}
              style={[
                s.reorderButton,
                {
                  backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]),
                },
              ]}
            >
              <Ionicons name="swap-horizontal" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[50])} />
              <Text
                style={{ color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[50]), fontSize: 10, fontWeight: "600" }}
              >
                Reorder
              </Text>
            </Pressable>
          ) : null}
        </View>
        <View style={s.nextButtonContainer}>
          <AspectRatioToggle aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />
          <Button
            text="Next"
            onPress={() => router.push("/(app)/add/upload")}
            textStyle={{ color: COLORS.sky[50], fontSize: 14, fontWeight: "600" }}
            buttonStyle={{
              paddingLeft: 12,
              paddingRight: 8,
              backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[600]),
              borderRadius: 25,
              height: 38,
            }}
            icon={<Ionicons name="chevron-forward-outline" size={16} color={COLORS.sky[50]} />}
            iconPosition="right"
            disabled={images.length === 0}
          />
        </View>
      </View>
      <ReorderImageModal
        visible={imagePreviewModalVisible}
        setVisible={setImagePreviewModalVisible}
        images={images}
        setImages={setImages}
      />
    </ScrollView>
  );
};

export default EditImages;

const s = StyleSheet.create({
  tapText: {
    paddingHorizontal: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.zinc[100],
    borderRadius: 25,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    overflow: "hidden",
    position: "relative",
  },
  nextButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  reorderButton: {
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
