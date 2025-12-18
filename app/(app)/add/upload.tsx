import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

import { createPost } from "@/api/post";
import CreateEditPostScreen from "@/components/CreateEditPostScreen/CreateEditPostScreen";
import { useAddPostContext } from "@/context/AddPostContext";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { usePostsContext } from "@/context/PostsContext";
import { SearchedProfile } from "@/types";
import { getImageHeightAspectAware, getImageUri } from "@/utils/utils";

const AddPostScreen = () => {
  const router = useRouter();
  const screenWidth = useWindowDimensions().width;

  const { addPost } = usePostsContext();
  const { authProfile, updatePostsCount } = useAuthProfileContext();
  const {
    setImages,
    addTag: addTagToState,
    removeTag: removeTagFromState,
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
    aspectRatio,
  } = useAddPostContext();

  // Handle discard post
  const handleDiscardPost = () => {
    resetState();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissAll();
    }
  };

  // Handle adding tag (non-async for create mode)
  const handleAddTag = (imageId: string, profile: SearchedProfile, xPosition: number, yPosition: number) => {
    addTagToState(imageId, profile, xPosition, yPosition);
  };

  // Handle removing tag (non-async for create mode)
  const handleRemoveTag = (tagId: string) => {
    removeTagFromState(tagId);
  };

  // Handle creating post
  const handleCreatePost = async () => {
    setCaptionError("");

    let hasErrors = false;
    if (!caption) {
      setCaptionError("Please enter a caption.");
      hasErrors = true;
    }

    if (caption.trim().length > 1000) {
      setCaptionError("Caption exceeds 1000 character limit.");
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
    formData.append("caption", caption.trim());
    formData.append("profileId", authProfile.id.toString());
    formData.append("aiGenerated", aiGenerated.toString());
    formData.append("aspectRatio", aspectRatio);

    // Format tags as an object with image indices as keys
    const tagsFormatted: { [key: string]: any[] } = {};
    const imageHeight = Math.round(getImageHeightAspectAware(screenWidth, aspectRatio));

    images.forEach((image, index) => {
      if (image.tags && image.tags.length > 0) {
        tagsFormatted[index.toString()] = image.tags.map((tag) => {
          console.log("TAG: ", tag);
          console.log("TAG X POSITION: ", tag.x_position);
          console.log("TAG Y POSITION: ", tag.y_position);
          return {
            taggedProfileId: tag.tagged_profile.id,
            xPosition: parseFloat(tag.x_position.toFixed(2)),
            yPosition: parseFloat(tag.y_position.toFixed(2)),
            originalHeight: imageHeight,
            originalWidth: screenWidth,
          };
        });
      }
    });

    // Only append tags if there are any
    if (Object.keys(tagsFormatted).length > 0) {
      formData.append("tags", JSON.stringify(tagsFormatted));
    }

    images.forEach((image, i) => {
      formData.append("images", {
        uri: getImageUri(image),
        name: `image_${i}.jpeg`,
        type: "image/jpeg",
        mimeType: "multipart/form-data",
      } as any);

      formData.append("order", i.toString());
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
        // Dismiss all existing modals/stacks
        router.dismissAll();
        // Replace the current history with the root route
        router.replace("/");
        // Navigate to the posts screen
        setTimeout(() => {
          router.navigate("/(app)/posts");
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Post successfully created!",
          });
        }, 50);
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
    <CreateEditPostScreen
      isEdit={false}
      images={images}
      caption={caption}
      setCaption={setCaption}
      captionError={captionError}
      setCaptionError={setCaptionError}
      aiGenerated={aiGenerated}
      setAiGenerated={setAiGenerated}
      submitLoading={submitLoading}
      setSubmitLoading={setSubmitLoading}
      addTag={handleAddTag}
      removeTag={handleRemoveTag}
      handleSubmit={handleCreatePost}
      handleDiscard={handleDiscardPost}
      aspectRatio={aspectRatio}
    />
  );
};

export default AddPostScreen;
