import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { ScrollView, TextInput as RNTextInput, View, Dimensions, StyleSheet, Pressable } from "react-native";
import Toast from "react-native-toast-message";

import { deletePostImage, updatePost as updatePostApi } from "@/api/post";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import ImageLoader from "@/components/ImageLoader/ImageLoader";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostsContext } from "@/context/PostsContext";
import { PostImage } from "@/types";
import { getImageUri } from "@/utils/utils";

const { width } = Dimensions.get("window");

const EditPost = () => {
  const postId = useLocalSearchParams<{ postId: string }>().postId;

  const navigation = useNavigation();
  const router = useRouter();

  const scrollViewRef = useRef<ScrollView>(null);
  const confirmDeleteModalRef = useRef<RNBottomSheetModal>(null);

  const { setLightOrDark } = useColorMode();
  const { data: posts, removeImageFromPost, updatePost } = usePostsContext();

  const postToEdit = posts?.find((post) => post.id === parseInt(postId));

  const [textInputHeight, setTextInputHeight] = useState(0);
  const [caption, setCaption] = useState(postToEdit?.caption || "");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<PostImage | null>(null);
  const [imageDeleteLoading, setImageDeleteLoading] = useState(false);

  // scroll down when screen loads so the text input is totally visible
  // also auto scrolls as the user types
  useEffect(() => {
    if (scrollViewRef.current && textInputHeight > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 10);
    }
  }, [scrollViewRef, textInputHeight]);

  // handle updating post with api call and in local state
  const handleUpdate = useCallback(async () => {
    if (postToEdit) {
      // if no Post changes were made, go back
      if (caption.trim() === postToEdit.caption) {
        router.back();
        return;
      }

      // if Post changes were made, update the post
      setUpdateLoading(true);
      const { error, data } = await updatePostApi(postToEdit.id, caption);
      if (data && !error) {
        updatePost(postToEdit.id, { ...postToEdit, caption });
        router.back();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Post successfully updated!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your post. Please try again.",
        });
      }
      setUpdateLoading(false);
    }
  }, [postToEdit, caption, router, updatePost]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          text="Done"
          variant="text"
          onPress={handleUpdate}
          loading={updateLoading || imageDeleteLoading}
          textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]), fontWeight: "500" }}
        />
      ),
      headerLeft: () => <Button text="Cancel" variant="text" onPress={() => router.back()} />,
      animation: "fade",
    });
  }, [caption, setLightOrDark, handleUpdate, updateLoading, navigation, router, imageDeleteLoading]);

  // handle the trash button press on the image
  const handleTrashButtonPress = (image: PostImage) => {
    setImageToDelete(image);
    Haptics.impactAsync();
    confirmDeleteModalRef.current?.present();
  };

  // handle delete image from the post from the bottom sheet confirmation modal
  const handleDelete = async (id: number | undefined) => {
    if (!id || !postToEdit?.id) return;
    setImageDeleteLoading(true);
    const { error } = await deletePostImage(id);
    if (!error) {
      removeImageFromPost(postToEdit?.id, id);
      confirmDeleteModalRef.current?.dismiss();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Image successfully deleted from post.",
      });
    } else {
      confirmDeleteModalRef.current?.dismiss();
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error deleting that image. Please try again.",
      });
    }
    setImageDeleteLoading(false);
  };

  // make the caption length color red if it is at max allowed length
  const captionLengthColor = caption.length >= 1000 ? COLORS.red[500] : COLORS.zinc[500];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: 24 }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
    >
      {postToEdit?.images ? (
        <View style={{ flex: 1, paddingBottom: 24 }}>
          <ImageSwiper
            images={postToEdit?.images}
            renderItem={({ item }) => {
              return (
                <View style={{ width: width, height: width, position: "relative" }}>
                  {postToEdit.images.length > 1 ? (
                    <Pressable
                      style={({ pressed }) => [s.removeButton, { opacity: pressed ? 0.7 : 1 }]}
                      onPress={() => handleTrashButtonPress(item as PostImage)}
                      hitSlop={10}
                      disabled={imageDeleteLoading}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.zinc[200]} />
                    </Pressable>
                  ) : null}
                  <ImageLoader uri={getImageUri(item)} height={width} width={width} style={s.image} />
                </View>
              );
            }}
          />
          <RNTextInput
            value={caption}
            onChangeText={(text) => setCaption(text)}
            multiline
            numberOfLines={undefined}
            maxLength={1000}
            textAlignVertical="top"
            editable={!updateLoading}
            scrollEnabled={false}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 30);
            }}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setTextInputHeight(height);
            }}
            style={{
              fontSize: 16,
              padding: 16,
              color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]),
            }}
          />
          <Text style={[s.captionLength, { color: captionLengthColor }]}>{caption.length}/1000</Text>
        </View>
      ) : null}

      <BottomSheetModal
        ref={confirmDeleteModalRef}
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
                width={width / 2}
                height={width / 2}
                style={{ borderRadius: 8 }}
              />
            ) : null}
          </View>
          <View style={{ flexDirection: "row", gap: 12, padding: 16 }}>
            <View style={{ flex: 1 }}>
              <Button text="Cancel" onPress={() => confirmDeleteModalRef.current?.dismiss()} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                text="Delete"
                onPress={() => handleDelete(imageToDelete?.id)}
                buttonStyle={{ backgroundColor: COLORS.red[600] }}
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </ScrollView>
  );
};

export default EditPost;

const s = StyleSheet.create({
  image: {
    width: width,
    height: width,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
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
