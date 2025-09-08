import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { View, Dimensions, StyleSheet, ScrollView, Pressable } from "react-native";
import ImagePicker from "react-native-image-crop-picker";

import Button from "@/components/Button/Button";
import ImagePreviewModal from "@/components/Camera/ImagePreviewModal/ImagePreviewModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAddPostContext } from "@/context/AddPostContext";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

const EditImages = () => {
  const { setLightOrDark } = useColorMode();
  const { images, setImages } = useAddPostContext();
  const tabBarHeight = useBottomTabBarHeight();

  const screenWidth = Dimensions.get("window").width;

  const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState(false);

  const handleRemove = (uri: string) => {
    setImages((prev) => prev.filter((image) => getImageUri(image) !== uri));
  };

  const handleImagePress = (uri: string) => {
    ImagePicker.openCropper({
      path: uri,
      width: 400,
      height: 400,
      mediaType: "photo",
    })
      .then((croppedImage) => {
        setImages((prev) => {
          return prev.map((image) => {
            if (getImageUri(image) === uri) {
              return croppedImage;
            }
            return image;
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: tabBarHeight + 24 }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, paddingTop: 54 }}>
        <Text style={s.tapText} lightColor={COLORS.zinc[900]} darkColor={COLORS.zinc[100]}>
          Tap to Crop
        </Text>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, height: screenWidth * 0.8 }}
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
                    height: screenWidth * 0.8,
                  },
                ]}
                key={getImageUri(image)}
                onPress={() => handleImagePress(getImageUri(image))}
              >
                {({ pressed }) => (
                  <>
                    <Pressable style={s.removeButton} onPress={() => handleRemove(getImageUri(image))}>
                      <Ionicons name="close-outline" size={20} color="black" />
                    </Pressable>
                    <Image
                      source={{ uri: getImageUri(image) }}
                      style={[
                        {
                          borderRadius: 6,
                          width: screenWidth * 0.8,
                          height: screenWidth * 0.8,
                        },
                        {
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        },
                      ]}
                    />
                  </>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
          <Pressable
            onPress={() => setImagePreviewModalVisible(true)}
            style={[
              s.reorderButton,
              {
                backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
              },
            ]}
          >
            <Ionicons name="swap-horizontal" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[50])} />
            <Text style={{ color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[50]), fontSize: 10, fontWeight: "600" }}>
              Reorder
            </Text>
          </Pressable>
        </View>
        <View style={s.nextButtonContainer}>
          <Button
            text="Next"
            onPress={() => router.push("/(app)/add/")}
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
          />
        </View>
      </View>
      <ImagePreviewModal
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
    justifyContent: "flex-end",
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
