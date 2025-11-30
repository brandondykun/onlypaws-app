import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useNavigation } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  TextInput as RNTextInput,
  Platform,
  useWindowDimensions,
  Pressable,
  StyleSheet,
} from "react-native";

import AddPostAiSection from "@/components/AddPostAiSection/AddPostAiSection";
import AddPostTagsSection from "@/components/AddPostTagsSection/AddPostTagsSection";
import AiModal from "@/components/AiModal/AiModal";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import DiscardPostModal from "@/components/DiscardPostModal/DiscardPostModal";
import ImageLoader from "@/components/ImageLoader/ImageLoader";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import Modal from "@/components/Modal/Modal";
import PostImageWithTags from "@/components/PostImageWithTags/PostImageWithTags";
import TagImagesModal from "@/components/TagImagesModal/TagImagesModal";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostImage, SearchedProfile } from "@/types";
import { ImageAssetWithTags } from "@/types/post/post";
import { getImageUri } from "@/utils/utils";

type Props = {
  isEdit: boolean;
  images: ImageAssetWithTags[] | PostImage[];
  caption: string;
  captionError: string;
  submitLoading: boolean;
  aiGenerated?: boolean; // Only used in create mode
  setCaption: (caption: string) => void;
  setCaptionError: (error: string) => void;
  setSubmitLoading: (loading: boolean) => void;
  setAiGenerated?: (generated: boolean) => void; // Only used in create mode
  addTag: (imageId: string, profile: SearchedProfile, xPosition: number, yPosition: number) => void | Promise<void>;
  removeTag: (tagId: string) => void | Promise<void>;
  handleSubmit: () => Promise<void>;
  handleDiscard: () => void;
  onRemoveImage?: (image: PostImage | ImageAssetWithTags) => Promise<void>; // Only used in edit mode
  submitButtonText?: string;
  discardButtonText?: string;
  loadingText?: string;
  addTagLoading?: boolean; // For edit mode tag operations
  removeTagLoading?: boolean; // For edit mode tag operations
  removeImageLoading?: boolean; // For edit mode image deletion
};

const CreateEditPostScreen = ({
  isEdit,
  images,
  caption,
  captionError,
  submitLoading,
  aiGenerated,
  setCaption,
  setCaptionError,
  setSubmitLoading,
  setAiGenerated,
  addTag,
  removeTag,
  handleSubmit,
  handleDiscard,
  onRemoveImage,
  submitButtonText = isEdit ? "Update Post" : "Add Post",
  discardButtonText = isEdit ? "Cancel" : "Discard",
  loadingText = isEdit ? "Updating Post" : "Uploading Post",
  addTagLoading = false,
  removeTagLoading = false,
  removeImageLoading = false,
}: Props) => {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const aiModalRef = useRef<RNBottomSheetModal>(null);
  const discardPostModalRef = useRef<RNBottomSheetModal>(null);
  const confirmDeleteImageModalRef = useRef<RNBottomSheetModal>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<RNTextInput>(null);
  const screenWidth = useWindowDimensions().width;

  const { setLightOrDark } = useColorMode();

  const [tagImagesModalVisible, setTagImagesModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<PostImage | ImageAssetWithTags | null>(null);
  const [showTagPopovers, setShowTagPopovers] = useState(true);

  // Add header buttons
  useLayoutEffect(() => {
    if (isEdit) {
      navigation.setOptions({
        headerRight: () => (
          <Button
            text="Done"
            variant="text"
            onPress={handleSubmit}
            loading={submitLoading || removeImageLoading || addTagLoading || removeTagLoading}
            textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]), fontWeight: "500" }}
          />
        ),
        headerLeft: () => <Button text={discardButtonText} variant="text" onPress={handleDiscard} />,
        animation: "fade",
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <Button
            onPressOut={() => discardPostModalRef.current?.present()}
            variant="text"
            text={discardButtonText}
            disabled={submitLoading}
          />
        ),
      });
    }
  }, [
    navigation,
    isEdit,
    submitLoading,
    removeImageLoading,
    addTagLoading,
    removeTagLoading,
    handleSubmit,
    handleDiscard,
    setLightOrDark,
    discardButtonText,
  ]);

  // Handle trash button press on image (edit mode only)
  const handleTrashButtonPress = (image: PostImage | ImageAssetWithTags) => {
    setImageToDelete(image);
    Haptics.impactAsync();
    confirmDeleteImageModalRef.current?.present();
  };

  // Handle delete image from post
  const handleDeleteImage = async () => {
    if (!imageToDelete || !onRemoveImage) return;
    await onRemoveImage(imageToDelete);
    confirmDeleteImageModalRef.current?.dismiss();
  };

  // Handle caption text input focus (create mode)
  const handleFocus = () => {
    scrollViewRef.current?.scrollTo({ y: screenWidth + 33, animated: true });
  };

  // Get a list of all the tagged usernames without duplicates
  const taggedUsernames: string[] = [];
  images.forEach((image) => {
    if ("tags" in image && image.tags) {
      image.tags.forEach((tag) => {
        if (!taggedUsernames.includes(tag.tagged_profile.username)) {
          taggedUsernames.push(tag.tagged_profile.username);
        }
      });
    }
  });

  // Make caption length color red if it is at max allowed length
  const captionLengthColor = caption.length >= 1000 ? COLORS.red[500] : COLORS.zinc[500];

  // Check if the post is a PostImage (has numeric id)
  const isPostImage = (image: PostImage | ImageAssetWithTags): image is PostImage => {
    return "id" in image && typeof image.id === "number";
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: isEdit ? 24 : tabBarHeight + 48 }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!submitLoading}
      ref={scrollViewRef}
    >
      {isEdit ? (
        // Edit mode - show images with delete buttons and existing tags
        <View style={{ flex: 1, paddingBottom: 24 }}>
          <ImageSwiper
            images={images}
            renderItem={({ item }) => {
              const image = item as PostImage | ImageAssetWithTags;
              return (
                <View style={{ width: screenWidth, height: screenWidth, position: "relative" }}>
                  {images.length > 1 && onRemoveImage ? (
                    <Pressable
                      style={({ pressed }) => [s.removeButton, { opacity: pressed ? 0.7 : 1 }]}
                      onPress={() => handleTrashButtonPress(image)}
                      hitSlop={10}
                      disabled={removeImageLoading || submitLoading}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.zinc[200]} />
                    </Pressable>
                  ) : null}
                  {isPostImage(image) ? (
                    <PostImageWithTags
                      item={image}
                      showTagPopovers={showTagPopovers}
                      setShowTagPopovers={setShowTagPopovers}
                    />
                  ) : (
                    <ImageLoader uri={getImageUri(image)} height={screenWidth} width={screenWidth} style={s.image} />
                  )}
                </View>
              );
            }}
          />
          <View style={{ paddingVertical: 16, paddingTop: 0, flex: 1 }}>
            <View style={{ marginBottom: 16 }}>
              <RNTextInput
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={undefined}
                maxLength={1000}
                textAlignVertical="top"
                editable={!submitLoading}
                scrollEnabled={false}
                onFocus={handleFocus}
                style={{
                  fontSize: 16,
                  padding: 16,
                  color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]),
                }}
              />
              <Text style={[s.captionLength, { color: captionLengthColor }]}>{caption.length}/1000</Text>
            </View>
            <AddPostTagsSection
              taggedUsernames={taggedUsernames}
              setTagImagesModalVisible={setTagImagesModalVisible}
              isEdit={true}
            />
            <View style={{ paddingHorizontal: 16 }}>
              {aiGenerated !== undefined && setAiGenerated ? (
                <AddPostAiSection aiModalRef={aiModalRef} aiGenerated={aiGenerated} setAiGenerated={setAiGenerated} />
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        // Create mode - show images with tags section and AI section
        <>
          <ImageSwiper images={images} showTagPopovers={showTagPopovers} setShowTagPopovers={setShowTagPopovers} />
          <View style={{ paddingVertical: 16, paddingTop: 0, flex: 1 }}>
            <View style={{ marginBottom: 16 }}>
              <TextInput
                ref={textInputRef}
                value={caption}
                onChangeText={setCaption}
                multiline={true}
                placeholder="Paw-some caption goes here..."
                numberOfLines={Platform.OS === "ios" ? 100 : 10}
                error={captionError}
                showCharCount
                maxLength={1000}
                textAlignVertical="top"
                onFocus={handleFocus}
                inputStyle={{
                  minHeight: 140,
                  maxHeight: 800,
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  borderRadius: 4,
                  fontSize: 16,
                  marginBottom: 6,
                  paddingHorizontal: 16,
                }}
                focusedBorderColor={"transparent"}
                charCountPaddingRight={8}
                scrollEnabled={false}
              />
            </View>
            <AddPostTagsSection
              taggedUsernames={taggedUsernames}
              setTagImagesModalVisible={setTagImagesModalVisible}
              isEdit={false}
            />
            <View style={{ paddingHorizontal: 16 }}>
              {aiGenerated !== undefined && setAiGenerated ? (
                <AddPostAiSection aiModalRef={aiModalRef} aiGenerated={aiGenerated} setAiGenerated={setAiGenerated} />
              ) : null}
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <Button text={submitButtonText} onPress={handleSubmit} loading={submitLoading} />
              </View>
            </View>
          </View>
        </>
      )}

      {/* AI Modal */}
      {aiGenerated !== undefined && setAiGenerated && <AiModal ref={aiModalRef} />}

      {/* Loading Modal */}
      <Modal visible={submitLoading} animationType="fade" withScroll={false} transparent={true} raw={true}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: setLightOrDark("rgba(255, 255, 255, 0.9)", "rgba(0, 0, 0, 0.85)"),
          }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View>
            <LottieView
              style={{ height: 150, width: 150 }}
              source={require("../../assets/animations/upload.json")}
              autoPlay
              loop
            />
          </View>
          <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={{ fontSize: 26, fontWeight: "300" }}>
            {loadingText}
          </Text>
        </View>
      </Modal>

      {/* Tag Images Modal */}
      <TagImagesModal
        images={images}
        addTag={addTag}
        removeTag={removeTag}
        visible={tagImagesModalVisible}
        setVisible={setTagImagesModalVisible}
        addTagLoading={addTagLoading}
        removeTagLoading={removeTagLoading}
      />

      {/* Discard Post Modal (create mode only) */}
      {!isEdit && <DiscardPostModal ref={discardPostModalRef} onDiscard={handleDiscard} />}

      {/* Confirm Delete Image Modal (edit mode only) */}
      {isEdit && onRemoveImage && (
        <BottomSheetModal
          ref={confirmDeleteImageModalRef}
          handleTitle="Confirm Delete"
          snapPoints={[]}
          enableDynamicSizing={true}
        >
          <BottomSheetView style={s.bottomSheetView}>
            <View style={{ padding: 16, paddingBottom: 0, gap: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "500", textAlign: "center" }}>
                Are you sure you want to delete this image from the post? This action cannot be undone.
              </Text>
            </View>
            <View style={{ alignItems: "center", marginVertical: 32 }}>
              {imageToDelete ? (
                <ImageLoader
                  uri={getImageUri(imageToDelete)}
                  width={screenWidth / 2}
                  height={screenWidth / 2}
                  style={{ borderRadius: 8 }}
                />
              ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: 12, padding: 16 }}>
              <View style={{ flex: 1 }}>
                <Button
                  text="Cancel"
                  onPress={() => confirmDeleteImageModalRef.current?.dismiss()}
                  disabled={removeImageLoading}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  text="Delete"
                  onPress={handleDeleteImage}
                  buttonStyle={{ backgroundColor: COLORS.red[600] }}
                  loading={removeImageLoading}
                />
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </ScrollView>
  );
};

export default CreateEditPostScreen;

const s = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.zinc[800],
    borderRadius: 8,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    borderWidth: 2,
    borderColor: COLORS.zinc[800],
    shadowColor: COLORS.zinc[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetView: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  captionLength: {
    fontSize: 12,
    textAlign: "right",
    paddingRight: 16,
    paddingTop: 8,
  },
});
