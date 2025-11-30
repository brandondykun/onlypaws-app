import { ImagePickerAsset } from "expo-image-picker";
import { Image as CropperImage } from "react-native-image-crop-picker";
import { PhotoFile } from "react-native-vision-camera";

import { PostDetailed, Profile, SearchedProfile } from "@/types";

export interface ChainComment {
  id: number;
  text: string;
  profile: Profile;
  post: number;
  created_at: string; // ISO 8601 datetime string
  parent_comment: number | null;
  reply_to_comment: number | null;
  reply_to_comment_username: string | null;
  likes_count: number;
  liked: boolean;
}

// Main response type for the comment chain endpoint
export interface CommentChainResponse {
  target_comment: ChainComment;
  root_parent_comment: ChainComment | null;
  parent_chain: ChainComment[]; // Up to 10 items
  omitted_count: number;
  post: PostDetailed;
}

export type CreatePostImageTag = {
  tagged_profile: SearchedProfile;
  x_position: number;
  y_position: number;
  positioningMode: "pixel" | "percentage";
  id: string;
};

// When creating a post, the tags are stored inside of the image asset object
export type PhotoFileWithTags = PhotoFile & {
  id: string;
  tags: CreatePostImageTag[];
};

// When creating a post, the tags are stored inside of the image asset object
export type ImagePickerAssetWithTags = ImagePickerAsset & {
  id: string;
  tags: CreatePostImageTag[];
};

// When creating a post, the tags are stored inside of the image asset object
export type CropperImageWithTags = CropperImage & {
  id: string;
  tags: CreatePostImageTag[];
};

export type ImageAssetWithTags = PhotoFileWithTags | ImagePickerAssetWithTags | CropperImageWithTags;

export type ImageAsset = PhotoFile | ImagePickerAsset | CropperImage;
