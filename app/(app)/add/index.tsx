import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import React, { useLayoutEffect, useRef } from "react";
import { ScrollView, View, Switch, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

import { createPost } from "@/api/post";
import AiModal from "@/components/AiModal/AiModal";
import Button from "@/components/Button/Button";
import DiscardPostModal from "@/components/DiscardPostModal/DiscardPostModal";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import Modal from "@/components/Modal/Modal";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAddPostContext } from "@/context/AddPostContext";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostsContext } from "@/context/PostsContext";
import { getImageUri } from "@/utils/utils";

const AddPostScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const aiModalRef = useRef<RNBottomSheetModal>(null);
  const discardPostModalRef = useRef<RNBottomSheetModal>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { addPost } = usePostsContext();
  const { authProfile, updatePostsCount } = useAuthProfileContext();
  const { isDarkMode, setLightOrDark } = useColorMode();
  const {
    setImages,
    setCaption,
    setCaptionError,
    setAiGenerated,
    setSubmitLoading,
    images,
    caption,
    aiGenerated,
    submitLoading,
    captionError,
    resetState,
  } = useAddPostContext();

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPressOut={() => discardPostModalRef.current?.present()}
          variant="text"
          text="Discard"
          disabled={submitLoading}
        />
      ),
    });
  });

  // handle discard post from discard post modal
  const handleDiscardPost = () => {
    resetState();
    router.dismissAll();
    router.back();
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
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
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
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: tabBarHeight + 48 }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!submitLoading}
      ref={scrollViewRef}
    >
      <View style={{ marginBottom: 36 }}>
        <ImageSwiper images={images} />
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
            numberOfLines={3}
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
      <AiModal ref={aiModalRef} />
      <Modal visible={submitLoading} animationType="fade" withScroll={false} transparent={true} raw={true}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.9)",
          }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View>
            <LottieView
              style={{ height: 150, width: 150 }}
              source={require("../../../assets/animations/upload.json")}
              autoPlay
              loop
            />
          </View>
          <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={{ fontSize: 26, fontWeight: "300" }}>
            Uploading Post
          </Text>
        </View>
      </Modal>
      <DiscardPostModal ref={discardPostModalRef} onDiscard={handleDiscardPost} />
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
