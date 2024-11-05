import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileImage as ProfileImageType } from "@/types";

type Props = {
  image: ProfileImageType | null;
  size: number;
  iconSize?: number;
};

const ProfileImage = ({ image, iconSize, size }: Props) => {
  const { isDarkMode } = useColorMode();

  const iconHeight = iconSize ? iconSize : Math.round(size * 0.75);
  const imageSize = size ? size : 35;

  return (
    <>
      {image?.image ? (
        <Image
          source={{ uri: image.image }}
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
