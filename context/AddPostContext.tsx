import { ImagePickerAsset } from "expo-image-picker";
import { createContext, useContext, useState } from "react";
import { Image as CropperImage } from "react-native-image-crop-picker";
import { PhotoFile } from "react-native-vision-camera";

type PostContextType = {
  images: (PhotoFile | ImagePickerAsset | CropperImage)[];
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset | CropperImage)[]>>;
  caption: string;
  setCaption: React.Dispatch<React.SetStateAction<string>>;
  captionError: string;
  setCaptionError: React.Dispatch<React.SetStateAction<string>>;
  aiGenerated: boolean;
  setAiGenerated: React.Dispatch<React.SetStateAction<boolean>>;
  submitLoading: boolean;
  setSubmitLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetState: () => void;
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
});

type Props = {
  children: React.ReactNode;
};

const AddPostContextProvider = ({ children }: Props) => {
  const [images, setImages] = useState<(PhotoFile | ImagePickerAsset | CropperImage)[]>([]);
  const [caption, setCaption] = useState("");
  const [captionError, setCaptionError] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

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
  };

  return <AddPostContext.Provider value={value}>{children}</AddPostContext.Provider>;
};

export default AddPostContextProvider;

export const useAddPostContext = () => {
  const {
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
  } = useContext(AddPostContext);
  return {
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
  };
};
