import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ImagePickerAsset } from "expo-image-picker";
import { Image } from "react-native-image-crop-picker";
import { PhotoFile } from "react-native-vision-camera";

import { PostDetailed, ProfileDetails, PostImage, ProfileImage } from "@/types";
import { FeedbackTicketType } from "@/types/feedback/feedback";

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

export const savePostInState = (stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>, postId: number) => {
  stateSetter((prev) => {
    return prev.map((post) => {
      if (post.id === postId) {
        return { ...post, is_saved: true };
      }
      return post;
    });
  });
};

export const unSavePostInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.map((post) => {
      if (post.id === postId) {
        return { ...post, is_saved: false };
      }
      return post;
    });
  });
};

export const togglePostHiddenInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.map((prevPost) => {
      if (prevPost.id === postId) {
        return { ...prevPost, is_hidden: !prevPost.is_hidden };
      }
      return prevPost;
    });
  });
};

export const addPostReportedInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.map((prevPost) => {
      if (prevPost.id === postId) {
        return { ...prevPost, is_reported: true, is_hidden: true };
      }
      return prevPost;
    });
  });
};

export const removePostInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.filter((prevPost) => prevPost.id !== postId);
  });
};

export const followProfileInState = (stateSetter: React.Dispatch<React.SetStateAction<ProfileDetails | null>>) => {
  stateSetter((prev) => {
    if (!prev) return null;
    return { ...prev, is_following: true, followers_count: prev.followers_count + 1 };
  });
};

export const unFollowProfileInState = (stateSetter: React.Dispatch<React.SetStateAction<ProfileDetails | null>>) => {
  stateSetter((prev) => {
    if (!prev) return null;
    return { ...prev, is_following: false, followers_count: prev.followers_count - 1 };
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

export const isPhotoFile = (image: PhotoFile | ImagePickerAsset | PostImage | ProfileImage): image is PhotoFile => {
  // Determine if image is a PhotoFile
  // PhotoFile has a path key, where ImagePickerAsset has a uri key
  return image.hasOwnProperty("path");
};

export const isPostImage = (image: PhotoFile | ImagePickerAsset | PostImage | ProfileImage): image is PostImage => {
  return image.hasOwnProperty("image");
};

export const isProfileImage = (
  image: PhotoFile | ImagePickerAsset | PostImage | ProfileImage,
): image is ProfileImage => {
  return image.hasOwnProperty("image") && image.hasOwnProperty("profile");
};

export const isCropperImage = (
  image: PhotoFile | ImagePickerAsset | PostImage | ProfileImage | Image,
): image is Image => {
  // Determine if image is a PhotoFile
  // PhotoFile has a path key, where ImagePickerAsset has a uri key
  return image.hasOwnProperty("path") && !image.hasOwnProperty("isRawPhoto");
};

export const getImageUri = (image: PhotoFile | ImagePickerAsset | PostImage | ProfileImage | Image) => {
  // Return an image uri from a PhotoFile or ImagePickerAsset or PostImage
  if (isCropperImage(image)) return image.path;
  // PhotoFile does not have a uri, it has a path that does not start with file://
  if (isPhotoFile(image)) return `file://${image.path}`;
  if (isPostImage(image)) return image.image;
  if (isProfileImage(image)) return image.image;
  return image.uri;
};

// Convert readable string feed back type to the type string needed for the API
export const getFeedbackType = (type: string): FeedbackTicketType => {
  if (type.toLowerCase() === "bug") return "bug";
  if (type.toLowerCase() === "feature request") return "feature";
  if (type.toLowerCase() === "general feedback") return "general";
  return "general";
};

// Convert the type string needed for the API to a readable string
export const getReadableFeedbackType = (type: FeedbackTicketType): string => {
  if (type === "bug") return "Bug Report";
  if (type === "feature") return "Feature Request";
  if (type === "general") return "General Feedback";
  return "General Feedback";
};

// Verify a username is valid - naive verification for the front end
export const verifyUsername = (username: string) => {
  if (username.length < 3) {
    return "Username must be at least 3 characters.";
  }

  if (username.length > 30) {
    return "Username must be less than 30 characters.";
  }

  if (username.includes(" ")) {
    return "Username cannot contain spaces.";
  }
  // If the username is valid, return null
  return null;
};
