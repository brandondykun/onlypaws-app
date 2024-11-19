import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ImagePickerAsset } from "expo-image-picker";
import { PhotoFile } from "react-native-vision-camera";

import { PostDetailed } from "@/types";

dayjs.extend(relativeTime);

export const getTimeSince = (pastDate: string) => {
  const output = dayjs().from(pastDate, true);
  return `${output} ago`;
};

export const likePostInState = (stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>, postId: number) => {
  stateSetter((prev) => {
    return prev.map((post) => {
      if (post.id === postId) {
        return { ...post, likes_count: post.likes_count + 1, liked: true };
      }
      return post;
    });
  });
};

export const unlikePostInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.map((prevPost) => {
      if (prevPost.id === postId) {
        return {
          ...prevPost,
          likes_count: prevPost.likes_count - 1,
          liked: false,
        };
      }
      return prevPost;
    });
  });
};

export const addCommentInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.map((prevPost) => {
      if (prevPost.id === postId) {
        return {
          ...prevPost,
          comments_count: prevPost.comments_count + 1,
        };
      }
      return prevPost;
    });
  });
};

export const abbreviateNumber = (num: number) => {
  if (num < 1000) {
    return num;
  } else if (num < 1000000) {
    const decimal = num / 1000;
    const rounded = Math.floor(decimal * 10) / 10;
    return `${rounded}K`;
  } else if (num < 1000000000) {
    const decimal = num / 1000000;
    const rounded = Math.floor(decimal * 10) / 10;
    return `${rounded}M`;
  } else if (num < 1000000000000) {
    const decimal = num / 1000000000;
    const rounded = Math.floor(decimal * 10) / 10;
    return `${rounded}B`;
  }
};

export const isPhotoFile = (image: PhotoFile | ImagePickerAsset): image is PhotoFile => {
  // Determine if image is a PhotoFile
  // PhotoFile has a path key, where ImagePickerAsset has a uri key
  return image.hasOwnProperty("path");
};

export const getImageUri = (image: PhotoFile | ImagePickerAsset) => {
  // Return an image uri from a PhotoFile or ImagePickerAsset
  // PhotoFile does not have a uri, it has a path that does not start with file://
  if (isPhotoFile(image)) {
    return `file://${image.path}`;
  }
  return image.uri;
};
