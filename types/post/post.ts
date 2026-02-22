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

export type ImageAspectRatio = "1:1" | "4:5";

// ============================================================================
// Presigned URL Upload Types
// ============================================================================

// Step 1: Prepare Upload
export type PrepareUploadRequest = {
  image_count: number;
};

export type UploadUrl = {
  url: string;
  key: string;
  order: number;
};

export type PrepareUploadResponse = {
  post_id: number;
  upload_urls: UploadUrl[];
  post_public_id: string;
};

// Step 3: Complete Post
export type ImageTagRequest = {
  taggedProfileId: number;
  xPosition: number;
  yPosition: number;
  originalWidth: number;
  originalHeight: number;
};

export type CompletePostRequest = {
  caption: string;
  aspect_ratio: ImageAspectRatio;
  ai_generated: boolean;
  tags?: Record<string, ImageTagRequest[]>;
};

export type PostReadyNotification = {
  type: "post_ready";
  post_id: number;
  message: string;
};
