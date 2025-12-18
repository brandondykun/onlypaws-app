import { View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";

type Props = {
  isProfileImage: boolean;
  maxImagesReached: boolean;
  maxImages: number;
  imagesCount: number;
};

const MaxImagesMessage = ({ isProfileImage, maxImagesReached, maxImages, imagesCount }: Props) => {
  return (
    <View style={{ marginBottom: -8, marginLeft: -12 }}>
      {!isProfileImage ? (
        <View style={{ justifyContent: "center", flexDirection: "row" }}>
          <Text
            darkColor={maxImagesReached ? COLORS.red[600] : COLORS.zinc[300]}
            lightColor={COLORS.zinc[950]}
            style={{ textAlign: "center", minWidth: 100, fontWeight: "500" }}
          >
            {imagesCount} of {maxImages}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default MaxImagesMessage;
