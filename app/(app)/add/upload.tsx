import { useRouter } from "expo-router";
import React from "react";
import { useWindowDimensions } from "react-native";

import { prepareUpload, uploadImageToR2, completePost } from "@/api/post";
import CreateEditPostScreen from "@/components/CreateEditPostScreen/CreateEditPostScreen";
import { useAddPostContext } from "@/context/AddPostContext";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { usePostsContext } from "@/context/PostsContext";
import { SearchedProfile } from "@/types";
import { ImageTagRequest } from "@/types/post/post";
import toast from "@/utils/toast";
import { getImageHeightAspectAware, getImageMimeType, getImageUri } from "@/utils/utils";

const AddPostScreen = () => {
  const router = useRouter();
  const screenWidth = useWindowDimensions().width;

  const { addPost } = usePostsContext();
  const { updatePostsCount } = useAuthProfileContext();
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

  // Handle creating post using presigned URL workflow
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
      toast.error("Please add at least one image.");
      hasErrors = true;
    }

    if (hasErrors) return;

    setSubmitLoading(true);

    try {
      // Step 1: Prepare upload - get presigned URLs
      const { data: prepareData, error: prepareError } = await prepareUpload(images.length);

      if (prepareError || !prepareData) {
        toast.error("There was an error creating that post. Please try again.");
        setSubmitLoading(false);
        return;
      }

      const { post_id: postId, upload_urls: uploadUrls } = prepareData;

      // Step 2: Upload images directly to R2 in parallel
      try {
        await Promise.all(
          uploadUrls.map((uploadUrl) => {
            const image = images[uploadUrl.order];
            const imageUri = getImageUri(image);
            if (!imageUri) {
              throw new Error(`Missing image URI for image at index ${uploadUrl.order}`);
            }
            const mimeType = getImageMimeType(image);
            return uploadImageToR2(uploadUrl.url, imageUri, mimeType);
          }),
        );
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        toast.error("There was an error creating that post. Please try again.");
        setSubmitLoading(false);
        return;
      }

      // Step 3: Complete post with metadata
      // Format tags as an object with image indices as keys
      const tagsFormatted: Record<string, ImageTagRequest[]> = {};
      const imageHeight = Math.round(getImageHeightAspectAware(screenWidth, aspectRatio));

      images.forEach((image, index) => {
        if (image.tags && image.tags.length > 0) {
          tagsFormatted[index.toString()] = image.tags.map((tag) => ({
            taggedProfileId: tag.tagged_profile.id,
            xPosition: parseFloat(tag.x_position.toFixed(2)),
            yPosition: parseFloat(tag.y_position.toFixed(2)),
            originalHeight: imageHeight,
            originalWidth: screenWidth,
          }));
        }
      });

      const { data: completeData, error: completeError } = await completePost(postId, {
        caption: caption.trim(),
        aspect_ratio: aspectRatio,
        ai_generated: aiGenerated,
        tags: Object.keys(tagsFormatted).length > 0 ? tagsFormatted : undefined,
      });

      if (completeError || !completeData) {
        toast.error("There was an error creating that post. Please try again.");
        setSubmitLoading(false);
        return;
      }

      // Set local image URIs directly in the image field for optimistic display
      // This allows the post to show local images while server processes them
      const postWithLocalImages = {
        ...completeData,
        images: completeData.images.map((postImage) => {
          const localImage = images[postImage.order];
          const localUri = localImage ? getImageUri(localImage) : null;
          return {
            ...postImage,
            // Use local URI if server image is null (during processing)
            image: postImage.image || localUri,
          };
        }),
      };

      // Success - update local state and navigate
      addPost(postWithLocalImages);
      updatePostsCount("add", 1);
      setCaption("");
      setImages([]);
      setAiGenerated(false);

      // Dismiss all existing modals/stacks
      router.dismissAll();
      // Replace the current history with the root route
      router.replace("/");
      // Navigate to the posts screen with flag to skip initial refetch
      setTimeout(() => {
        router.navigate({ pathname: "/(app)/posts", params: { skipRefetch: "true" } });
        // Note: Post may still be processing, but will appear in user's profile
        toast.success("Post created! Processing images...");
      }, 50);
    } catch (error) {
      console.error("Post creation failed:", error);
      toast.error("There was an error creating that post. Please try again.");
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
