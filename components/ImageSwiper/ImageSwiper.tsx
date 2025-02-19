import { ImagePickerAsset } from "expo-image-picker";
import { PhotoFile } from "react-native-vision-camera";

import { PostImage } from "@/types";

import CustomImageSwiper from "../CustomImageSwiper/CustomImageSwiper";

type Props = {
  images: PostImage[] | (PhotoFile | ImagePickerAsset)[];
};

const ImageSwiper = ({ images }: Props) => {
  return <CustomImageSwiper images={images} />;
};

export default ImageSwiper;
