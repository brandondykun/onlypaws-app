import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import { useState, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { savePost as savePostApi, unSavePost as unSavePostApi } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { PostDetailed } from "@/types";
import toast from "@/utils/toast";

type Props = {
  post: PostDetailed;
};

const SaveButton = ({ post }: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const { savePost, unSavePost } = usePostManagerContext();

  const saveButtonScaleValue = useRef(new Animated.Value(1)).current;
  const [saveLoading, setSaveLoading] = useState(false);

  // do not show save button if the post is from the current user
  if (post.profile.id === authProfile.id) return null;

  // handle saving or un-saving the post
  const handleBookmarkPress = async () => {
    setSaveLoading(true);
    if (post.is_saved) {
      // haptic feedback
      Haptics.selectionAsync();
      // animate the save button
      Animated.sequence([
        Animated.timing(saveButtonScaleValue, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonScaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // optimistic update
      unSavePost(post.id);
      // API call to un-save the post
      const { error } = await unSavePostApi(post.id);

      if (error) {
        // rollback if error
        savePost(post);
        toast.error("There was an error un-saving that post.");
      }
      // do not show success toast message when un-saving a post
    } else {
      // haptic feedback
      Haptics.impactAsync();
      // animate the save button
      Animated.sequence([
        Animated.timing(saveButtonScaleValue, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonScaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // optimistic update
      savePost(post);
      // API call to save the post
      const { error } = await savePostApi(post.id, authProfile.id);

      if (error) {
        // rollback if error
        unSavePost(post.id);
        toast.error("There was an error saving that post.");
      } else {
        // show success toast message
        toast.savePost({ imageUri: post.images[0].image });
      }
    }
    setSaveLoading(false);
  };

  return (
    <Pressable
      style={({ pressed }) => [pressed && s.pressed, s.root]}
      hitSlop={10}
      onPress={handleBookmarkPress}
      disabled={saveLoading || post.is_hidden}
      testID={`post-save-button-${post.id}`}
    >
      <Animated.View style={{ transform: [{ scale: saveButtonScaleValue }] }}>
        <FontAwesome
          name={post.is_saved ? "bookmark" : "bookmark-o"}
          size={20}
          color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default SaveButton;

const s = StyleSheet.create({
  root: {
    margin: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
