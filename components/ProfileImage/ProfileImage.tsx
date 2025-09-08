import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { ImagePickerAsset } from "expo-image-picker";
import React from "react";
import { View } from "react-native";
import { Image as CropperImage } from "react-native-image-crop-picker";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileImage as ProfileImageType } from "@/types";
import { getImageUri } from "@/utils/utils";

type Props = {
  image: ProfileImageType | PhotoFile | ImagePickerAsset | CropperImage | null;
  size: number;
  iconSize?: number;
};

const ProfileImage = ({ image, iconSize, size }: Props) => {
  const { isDarkMode } = useColorMode();

  const iconHeight = iconSize ? iconSize : Math.round(size * 0.7);
  const imageSize = size ? size : 35;

  const imageUri = image ? getImageUri(image) : null;

  return (
    <>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            borderRadius: imageSize,
            height: imageSize,
            width: imageSize,
          }}
        />
      ) : (
        <View
          style={{
            backgroundColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[300],
            height: imageSize,
            width: imageSize,
            borderRadius: imageSize,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 2,
          }}
        >
          <MaterialCommunityIcons
            name="dog"
            size={iconHeight}
            color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[400]}
          />
        </View>
      )}
    </>
  );
};

export default ProfileImage;
