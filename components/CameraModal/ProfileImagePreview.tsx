import { Ionicons } from "@expo/vector-icons";
import { ImagePickerAsset } from "expo-image-picker";
import { View, Pressable } from "react-native";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import ProfileDetailsHeaderImage from "../ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "../Text/Text";

type Props = {
  images: (ImagePickerAsset | PhotoFile)[];
  setImages: (value: React.SetStateAction<(ImagePickerAsset | PhotoFile)[]>) => void;
};

const ProfileImagePreview = ({ images, setImages }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <View style={{ flex: 1 }}>
        {images.length ? (
          <View>
            <Text darkColor={COLORS.zinc[400]} style={{ textAlign: "center", fontSize: 14, fontWeight: "300" }}>
              Tap to
            </Text>
            <Text darkColor={COLORS.zinc[400]} style={{ textAlign: "center", fontSize: 14, fontWeight: "300" }}>
              preview
            </Text>
          </View>
        ) : null}
      </View>
      <ProfileDetailsHeaderImage image={images.length ? images[0] : null} size={115} />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {images.length ? (
          <Pressable onPress={() => setImages([])} style={({ pressed }) => [pressed && { opacity: 0.5 }]}>
            <Ionicons name="close" size={36} color={setLightOrDark(COLORS.red[500], COLORS.red[600])} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default ProfileImagePreview;
