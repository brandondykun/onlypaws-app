import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  isProfileImage: boolean;
  maxImagesReached: boolean;
  maxImages: number;
  imagesCount: number;
};

const MaxImagesMessage = ({ isProfileImage, maxImagesReached, maxImages, imagesCount }: Props) => {
  const { isDarkMode } = useColorMode();

  return (
    <View style={{ height: 34 }}>
      {!isProfileImage ? (
        <View style={{ justifyContent: "center", flexDirection: "row" }}>
          <Text
            darkColor={maxImagesReached ? COLORS.red[600] : COLORS.zinc[300]}
            lightColor={COLORS.zinc[700]}
            style={{ textAlign: "center", minWidth: 100 }}
          >
            {imagesCount} of {maxImages}
          </Text>
        </View>
      ) : null}
      <View>
        <Text
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
          style={{ textAlign: "center", fontWeight: isDarkMode ? 200 : 300, paddingHorizontal: 36 }}
        >
          {maxImagesReached
            ? isProfileImage
              ? "Actual image quality will be slightly lower than the preview above."
              : "Remove images above to add more."
            : ""}
        </Text>
      </View>
    </View>
  );
};

export default MaxImagesMessage;
