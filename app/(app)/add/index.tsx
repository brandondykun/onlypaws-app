import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState, useLayoutEffect, useRef } from "react";
import { ScrollView, View, Pressable, Dimensions, Switch, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { PhotoFile } from "react-native-vision-camera";

import { createPost } from "@/api/post";
import AiModal from "@/components/AiModal/AiModal";
import Button from "@/components/Button/Button";
import CameraModal from "@/components/CameraModal/CameraModal";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostsContext } from "@/context/PostsContext";
import { getImageUri } from "@/utils/utils";

const AddPostScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const aiModalRef = useRef<RNBottomSheetModal>(null);
  const screenWidth = Dimensions.get("window").width;

  const { addPost } = usePostsContext();
  const { authProfile, updatePostsCount } = useAuthProfileContext();
  const { isDarkMode, setLightOrDark } = useColorMode();

  const [caption, setCaption] = useState("");
  const [captionError, setCaptionError] = useState("");
  const [images, setImages] = useState<(PhotoFile | ImagePickerAsset)[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button onPress={resetState} variant="text" text="Clear" />,
    });
  });

  const resetState = () => {
    setImages([]);
    setCaption("");
    setCaptionError("");
  };

  const handleAddPost = async () => {
    setCaptionError("");

    let hasErrors = false;
    if (!caption) {
      setCaptionError("Please enter a caption.");
      hasErrors = true;
    }

    if (images.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please add at least one image.",
      });
      hasErrors = true;
    }

    if (hasErrors) return;

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("profileId", authProfile.id.toString());
    formData.append("aiGenerated", aiGenerated.toString());

    images.forEach((image, i) => {
      formData.append("images", {
        uri: getImageUri(image),
        name: `image_${i}.jpeg`,
        type: "image/jpeg",
        mimeType: "multipart/form-data",
      } as any);
    });

    setSubmitLoading(true);
    const accessToken = await SecureStore.getItemAsync("ACCESS_TOKEN");
    if (accessToken) {
      const { error, data } = await createPost(formData, accessToken);
      if (data && !error) {
        addPost(data);
        updatePostsCount("add", 1);
        setCaption("");
        setImages([]);
        setAiGenerated(false);
        router.replace("/(app)/posts");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Post successfully created!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error creating that post. Please try again.",
        });
      }
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: tabBarHeight }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 4, paddingLeft: 12 }}>
        <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, fontWeight: "400", fontStyle: "italic" }}>
          Add up to 5 images
        </Text>
      </View>
      <View style={{ marginBottom: 36 }}>
        {images.length ? (
          <ImageSwiper images={images} imageHeight={screenWidth} imageWidth={screenWidth} />
        ) : (
          <Pressable onPress={() => setCameraVisible(true)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <View
              style={{
                height: screenWidth,
                width: screenWidth,
                backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300],
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialIcons
                  name="add-circle-outline"
                  size={28}
                  color={setLightOrDark(COLORS.lime[600], COLORS.lime[500])}
                />
                <Text lightColor={COLORS.zinc[700]} darkColor={COLORS.zinc[200]} style={{ fontSize: 20 }}>
                  Add Images
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        {images.length ? (
          <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16 }}>
            <Button variant="text" text="Edit Images" onPress={() => setCameraVisible(true)} />
          </View>
        ) : null}
      </View>
      <View style={{ marginBottom: 12, paddingLeft: 16 }}>
        <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, fontWeight: "400", fontStyle: "italic" }}>
          Add a caption
        </Text>
      </View>
      <View style={{ padding: 16, paddingTop: 0, flex: 1 }}>
        <View style={{ marginBottom: 36 }}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            label="Caption"
            multiline={true}
            numberOfLines={6}
            error={captionError}
            showCharCount
            maxLength={128}
            textAlignVertical="top"
          />
        </View>
        <View style={s.aiGeneratedContainer}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "400" }}>Contains AI Generated Content</Text>
            <Text
              darkColor={COLORS.zinc[400]}
              lightColor={COLORS.zinc[600]}
              style={{ fontSize: 14, fontWeight: "400" }}
            >
              Please identify if this post contains AI generated content.{" "}
              <Button
                buttonStyle={s.learnMoreButton}
                textStyle={[s.learnMoreButtonText, { color: setLightOrDark(COLORS.sky[600], COLORS.sky[400]) }]}
                variant="text"
                text="Learn More"
                onPress={() => aiModalRef.current?.present()}
                hitSlop={10}
              />
            </Text>
          </View>
          <Switch value={aiGenerated} onValueChange={() => setAiGenerated((prev) => !prev)} />
        </View>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Button text="Add Post" onPress={handleAddPost} loading={submitLoading} />
        </View>
      </View>
      <CameraModal
        images={images}
        setImages={setImages}
        visible={cameraVisible}
        setVisible={setCameraVisible}
        maxImages={5}
        onSavePress={() => setCameraVisible(false)}
      />
      <AiModal ref={aiModalRef} />
    </ScrollView>
  );
};

export default AddPostScreen;

const s = StyleSheet.create({
  aiGeneratedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 64,
  },
  learnMoreButton: {
    padding: 0,
    margin: 0,
    paddingTop: 0,
    height: "auto",
    marginBottom: -3,
  },
  learnMoreButtonText: {
    fontSize: 14,
    fontWeight: "400",
    textDecorationLine: "none",
  },
});
