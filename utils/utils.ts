import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ImagePickerAsset } from "expo-image-picker";
import { Image } from "react-native-image-crop-picker";
import { PhotoFile } from "react-native-vision-camera";

import { PostImage, ProfileImage, PostImageTag, PaginatedPostsResponse } from "@/types";
import { FeedbackTicketType } from "@/types/feedback/feedback";
import { CreatePostImageTag } from "@/types/post/post";

dayjs.extend(relativeTime);

export const getTimeSince = (pastDate: string) => {
  let output = dayjs().from(pastDate, true);
  output = output.replace(/minutes/gi, "mins");
  output = output.replace(/hours/gi, "hrs");
  output = output.replace(/seconds/gi, "sec");
  return `${output} ago`;
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

export const isValidCharacters = (str: string): boolean => {
  // Using regex: ^ means start, $ means end, so entire string must match
  // \w matches alphanumeric characters and underscores [a-zA-Z0-9_]
  // \. matches a literal period
  // + means one or more characters
  const regex = /^[\w.]+$/;
  return regex.test(str);
};

// Verify a username is valid - naive verification for the front end
export const verifyUsername = (username: string) => {
  if (username.length < 3) {
    return "Username must be at least 3 characters.";
  }

  if (username.length > 30) {
    return "Username must be less than 30 characters.";
  }

  if (!isValidCharacters(username)) {
    return "Username can only contain letters, numbers, periods, and underscores.";
  }

  // If the username is valid, return null
  return null;
};

export const isCreatePostImageTag = (tag: CreatePostImageTag | PostImageTag): tag is CreatePostImageTag => {
  return tag.hasOwnProperty("positioningMode");
};

// get the next page parameter from a paginated response
export const getNextPageParam = (lastPage: PaginatedPostsResponse) => {
  return lastPage?.next?.split("page=")[1] ?? null;
};

// convert minutes to milliseconds
export const minutesToMilliseconds = (minutes: number) => {
  return minutes * 1000 * 60;
};
