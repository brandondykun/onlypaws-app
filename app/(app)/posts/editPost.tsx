import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { ScrollView, TextInput as RNTextInput, View } from "react-native";
import Toast from "react-native-toast-message";

import { updatePost } from "@/api/post";
import Button from "@/components/Button/Button";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostsContext } from "@/context/PostsContext";

const EditPost = () => {
  const postId = useLocalSearchParams<{ postId: string }>().postId;

  const navigation = useNavigation();
  const router = useRouter();

  const textInputRef = useRef<RNTextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { setLightOrDark } = useColorMode();
  const { data: posts, setData } = usePostsContext();

  const postToEdit = posts?.find((post) => post.id === parseInt(postId));

  const [caption, setCaption] = useState(postToEdit?.caption || "");
  const [loading, setLoading] = useState(false);
  const [textInputHeight, setTextInputHeight] = useState(0);

  // focus input and bring up keyboard when screen loads
  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textInputRef]);

  // scroll down when screen loads so the text input is totally visible
  useEffect(() => {
    if (scrollViewRef.current && textInputHeight > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: textInputHeight + 24, animated: true });
      }, 100);
    }
  }, [scrollViewRef, textInputHeight]);

  // handle updating post with api call and in local state
  const handleUpdate = useCallback(async () => {
    if (postToEdit) {
      setLoading(true);
      const { error, data } = await updatePost(postToEdit.id, caption);
      if (data && !error) {
        setData((prev) => prev.map((post) => (post.id === postToEdit.id ? { ...post, caption } : post)));
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
      setLoading(false);
    }
  }, [postToEdit, caption, setData, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          text="Save"
          variant="text"
          onPress={handleUpdate}
          loading={loading}
          textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]), fontWeight: "500" }}
        />
      ),
      headerLeft: () => <Button text="Cancel" variant="text" onPress={() => router.back()} />,
      animation: "fade",
    });
  }, [caption, setLightOrDark, handleUpdate, loading, navigation, router]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: 24 }}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
    >
      {postToEdit?.images ? (
        <View style={{ flex: 1, paddingBottom: 24 }}>
          <ImageSwiper images={postToEdit?.images} />
          <RNTextInput
            ref={textInputRef}
            value={caption}
            onChangeText={(text) => setCaption(text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
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
        </View>
      ) : null}
    </ScrollView>
  );
};

export default EditPost;
