import { createContext, useContext, useState } from "react";

import { SearchedProfile } from "@/types";
import { ImageAssetWithTags } from "@/types/post/post";

type PostContextType = {
  images: ImageAssetWithTags[];
  setImages: React.Dispatch<React.SetStateAction<ImageAssetWithTags[]>>;
  caption: string;
  setCaption: React.Dispatch<React.SetStateAction<string>>;
  captionError: string;
  setCaptionError: React.Dispatch<React.SetStateAction<string>>;
  aiGenerated: boolean;
  setAiGenerated: React.Dispatch<React.SetStateAction<boolean>>;
  submitLoading: boolean;
  setSubmitLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetState: () => void;
  addTag: (imageId: string, profile: SearchedProfile, xPosition: number, yPosition: number) => void;
  removeTag: (tagId: string) => void;
};

const AddPostContext = createContext<PostContextType>({
  images: [],
  setImages: () => {},
  caption: "",
  setCaption: () => {},
  captionError: "",
  setCaptionError: () => {},
  aiGenerated: false,
  setAiGenerated: () => {},
  submitLoading: false,
  setSubmitLoading: () => {},
  resetState: () => {},
  addTag: () => {},
  removeTag: () => {},
});

type Props = {
  children: React.ReactNode;
};

// COMMENT ABOUT TAGS
// When creating a post, the tags are stored inside of the image asset objects
// This prevents from keeping 2 arrays - one of assets and one of tags and needing to keep them synced
// It also mimics how PostImage's and Tags are fetched from the database - so components can safely use the same data structure for both cases

const AddPostContextProvider = ({ children }: Props) => {
  const [images, setImages] = useState<ImageAssetWithTags[]>([]);
  const [caption, setCaption] = useState("");
  const [captionError, setCaptionError] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  // This function adds a tag to an image asset object
  const addTag = (imageId: string, profile: SearchedProfile, xPosition: number, yPosition: number) => {
    setImages((prev) =>
      prev.map((image) =>
        image.id === imageId
          ? {
              ...image,
              tags: [
                ...image.tags,
                {
                  tagged_profile: profile,
                  x_position: xPosition,
                  y_position: yPosition,
                  positioningMode: "pixel",
                  id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                },
              ],
            }
          : image,
      ),
    );
  };

  // This function removes a tag from an image asset object
  const removeTag = (tagId: string) => {
    setImages((prev) => {
      return prev.map((image) => {
        return { ...image, tags: image.tags.filter((tag) => tag.id !== tagId) };
      });
    });
  };

  const resetState = () => {
    setImages([]);
    setCaption("");
    setCaptionError("");
    setAiGenerated(false);
  };

  const value = {
    images,
    setImages,
    caption,
    setCaption,
    captionError,
    setCaptionError,
    aiGenerated,
    setAiGenerated,
    submitLoading,
    setSubmitLoading,
    resetState,
    addTag,
    removeTag,
  };

  return <AddPostContext.Provider value={value}>{children}</AddPostContext.Provider>;
};

export default AddPostContextProvider;

export const useAddPostContext = () => {
  const context = useContext(AddPostContext);
  if (!context) {
    throw new Error("useAddPostContext must be used within AddPostContextProvider");
  }
  return context;
};
