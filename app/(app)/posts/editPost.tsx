import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

import { deletePostImage, updatePost as updatePostApi } from "@/api/post";
import { createPostImageTag, deletePostImageTag } from "@/api/post";
import { getProfilePostsForQuery } from "@/api/profile";
import CreateEditPostScreen from "@/components/CreateEditPostScreen/CreateEditPostScreen";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { usePostsContext } from "@/context/PostsContext";
import { PostImage, SearchedProfile } from "@/types";
import { ImageAssetWithTags } from "@/types/post/post";
import { getNextPageParam } from "@/utils/utils";

const EditPost = () => {
  const postId = useLocalSearchParams<{ postId: string }>().postId;

  const { selectedProfileId } = useAuthUserContext();
  const router = useRouter();
  const screenWidth = useWindowDimensions().width;

  const { removeImageFromPost, updatePost } = usePostsContext();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(selectedProfileId!, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "authProfile"],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
  });

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  const postToEdit = dataToRender?.find((post) => post.id === parseInt(postId));

  const [caption, setCaption] = useState(postToEdit?.caption || "");
  const [captionError, setCaptionError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(postToEdit?.contains_ai || false);
  const [addTagLoading, setAddTagLoading] = useState(false);
  const [removeTagLoading, setRemoveTagLoading] = useState(false);
  const [removeImageLoading, setRemoveImageLoading] = useState(false);

  // Handle updating post
  const handleUpdatePost = async () => {
    if (!postToEdit) return;

    // if no Post changes were made, go back
    if (caption.trim() === postToEdit.caption) {
      router.back();
      return;
    }

    // if Post changes were made, update the post
    setUpdateLoading(true);
    const { error, data } = await updatePostApi(postToEdit.id, caption, aiGenerated);
    if (data && !error) {
      updatePost(postToEdit.id, { ...postToEdit, caption, contains_ai: aiGenerated });
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
  };

  // Handle cancel (discard changes)
  const handleCancel = () => {
    router.back();
  };

  // Handle deleting an image from the post
  const handleRemoveImage = async (image: PostImage | ImageAssetWithTags) => {
    if (!postToEdit?.id || !("id" in image) || typeof image.id !== "number") return;

    setRemoveImageLoading(true);
    const { error } = await deletePostImage(image.id);
    if (!error) {
      removeImageFromPost(postToEdit.id, image.id);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Image successfully deleted from post.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error deleting that image. Please try again.",
      });
    }
    setRemoveImageLoading(false);
  };

  // Handle deleting a tag (async)
  const handleDeleteTag = async (tagId: string) => {
    if (!postToEdit?.images) return;

    // Find the tag to get the profile ID before deleting
    let profileIdToRemove: number | null = null;
    for (const image of postToEdit.images) {
      const tag = image.tags.find((t) => t.id === Number(tagId));
      if (tag) {
        profileIdToRemove = tag.tagged_profile.id;
        break;
      }
    }

    setRemoveTagLoading(true);
    const { error } = await deletePostImageTag(tagId);
    if (!error) {
      // update the current post in state
      updatePost(Number(postId), {
        ...postToEdit,
        tagged_profiles: postToEdit.tagged_profiles.filter((profile) => profile.id !== profileIdToRemove),
        images: postToEdit.images.map((image) => {
          return { ...image, tags: image.tags.filter((tag) => tag.id !== Number(tagId)) };
        }),
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error deleting the tag. Please try again.",
      });
    }
    setRemoveTagLoading(false);
  };

  // Handle adding a tag (async)
  const handleAddTag = async (imageId: string, profile: SearchedProfile, xPosition: number, yPosition: number) => {
    if (!postToEdit?.images) return;

    setAddTagLoading(true);
    const { data, error } = await createPostImageTag({
      post_image_id: Number(imageId),
      tagged_profile_id: profile.id,
      // normalize the x and y positions to 0-100 percentage with max 2 decimal places
      x_position: Number(((xPosition / screenWidth) * 100).toFixed(2)),
      y_position: Number(((yPosition / screenWidth) * 100).toFixed(2)),
      original_width: screenWidth,
      original_height: screenWidth,
    });

    if (data && !error) {
      // update the current post in state
      updatePost(Number(postId), {
        ...postToEdit,
        tagged_profiles: [...postToEdit.tagged_profiles, profile],
        images: postToEdit.images.map((image) => {
          if (image.id === Number(imageId)) {
            return { ...image, tags: [...image.tags, data] };
          }
          return image;
        }),
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error adding the tag. Please try again.",
      });
    }
    setAddTagLoading(false);
  };

  const handleAiGeneratedChange = (generated: boolean) => {
    setAiGenerated(generated);
  };

  if (!postToEdit?.images) return null;

  return (
    <CreateEditPostScreen
      isEdit={true}
      images={postToEdit.images}
      caption={caption}
      setCaption={setCaption}
      captionError={captionError}
      setCaptionError={setCaptionError}
      aiGenerated={aiGenerated}
      setAiGenerated={handleAiGeneratedChange}
      submitLoading={updateLoading}
      setSubmitLoading={setUpdateLoading}
      addTag={handleAddTag}
      removeTag={handleDeleteTag}
      handleSubmit={handleUpdatePost}
      handleDiscard={handleCancel}
      onRemoveImage={handleRemoveImage}
      addTagLoading={addTagLoading}
      removeTagLoading={removeTagLoading}
      removeImageLoading={removeImageLoading}
    />
  );
};

export default EditPost;
