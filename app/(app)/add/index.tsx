import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState, useLayoutEffect } from "react";
import { ScrollView, View, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { PhotoFile } from "react-native-vision-camera";

import { createPost } from "@/api/post";
import Button from "@/components/Button/Button";
import CameraModal from "@/components/CameraModal/CameraModal";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostsContext } from "@/context/PostsContext";
import { getImageUri } from "@/utils/utils";

const AddPostScreen = () => {
  const router = useRouter();
  const { addPost } = usePostsContext();
  const { authProfile, updatePostsCount } = useAuthProfileContext();
  const { isDarkMode } = useColorMode();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const [caption, setCaption] = useState("");
  const [captionError, setCaptionError] = useState("");
  const [images, setImages] = useState<(PhotoFile | ImagePickerAsset)[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
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
    >
      <View style={{ marginBottom: 12, paddingLeft: 16 }}>
        <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, fontWeight: "400", fontStyle: "italic" }}>
          Add your images (up to 5)
        </Text>
      </View>
      <View style={{ marginBottom: 36 }}>
        <ScrollView
          horizontal
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
          showsHorizontalScrollIndicator={false}
        >
          {images.length === 0 ? (
            <>
              <Pressable onPress={() => setCameraVisible(true)}>
                <View
                  style={{
                    height: 200,
                    width: 200,
                    backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300],
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialIcons
                      name="add-circle-outline"
                      size={24}
                      color={isDarkMode ? COLORS.lime[500] : COLORS.zinc[900]}
                    />
                    <Text>Add Images</Text>
                  </View>
                </View>
              </Pressable>
              <View
                style={{
                  height: 200,
                  width: 200,
                  backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300],
                  borderRadius: 8,
                }}
              ></View>
            </>
          ) : (
            images.map((image) => {
              const uri = getImageUri(image);
              return <Image source={{ uri: uri }} style={{ borderRadius: 8, height: 200, width: 200 }} key={uri} />;
            })
          )}
        </ScrollView>
        {images.length ? (
          <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 16 }}>
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
      />
    </ScrollView>
  );
};

export default AddPostScreen;
