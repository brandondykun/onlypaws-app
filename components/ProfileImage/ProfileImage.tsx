import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileImage as ProfileImageType } from "@/types";
import { ImageAsset } from "@/types/post/post";
import { getImageUri } from "@/utils/utils";

type Props = {
  image: ProfileImageType | ImageAsset | string | null;
  size: number;
  iconSize?: number;
};

const ProfileImage = ({ image, iconSize, size }: Props) => {
  const { isDarkMode } = useColorMode();

  const iconHeight = iconSize ? iconSize : Math.round(size * 0.7);
  const imageSize = size ? size : 35;

  let imageUri = undefined;

  if (typeof image === "string") {
    imageUri = image;
  } else if (image) {
    imageUri = getImageUri(image);
  }

  return (
    <>
      {imageUri ? (
        <Image
          key={imageUri}
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
            backgroundColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[50],
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
