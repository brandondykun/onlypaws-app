import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";

import MaxImagesMessage from "@/components/Camera/MaxImagesMessage/MaxImagesMessage";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ImageAssetWithTags } from "@/types/post/post";
import { getImageUri } from "@/utils/utils";

type Props = {
  screenHeight: number;
  screenWidth: number;
  maxImagesReached: boolean;
  MAX_IMAGES: number;
  images: ImageAssetWithTags[];
  pickImage: () => void;
  takePicture: () => void;
  onNextButtonPress?: () => void;
  imageChangeLoading: boolean; // loading state for image change when image is loading after being taken or picked from camera roll
};

const CameraFooter = ({
  screenHeight,
  screenWidth,
  maxImagesReached,
  MAX_IMAGES,
  images,
  pickImage,
  takePicture,
  onNextButtonPress,
  imageChangeLoading,
}: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View style={[s.container, { height: (screenHeight - screenWidth) / 2 }]}>
      {/* <MaxImagesMessage
        isProfileImage={false}
        maxImagesReached={maxImagesReached}
        maxImages={MAX_IMAGES}
        imagesCount={images.length}
      /> */}
      <View style={{ flex: 1, justifyContent: "center", flexDirection: "row" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Pressable
            style={({ pressed }) => [
              !maxImagesReached && pressed ? { opacity: 0.5 } : maxImagesReached ? { opacity: 0.3 } : null,
              { justifyContent: "center", alignItems: "center" },
            ]}
            onPress={pickImage}
            disabled={maxImagesReached}
          >
            <Ionicons name="images" size={36} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[200])} />
            <Text style={{ fontSize: 10, fontWeight: "500", textAlign: "center", marginTop: 4 }}>Camera Roll</Text>
          </Pressable>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center", opacity: maxImagesReached ? 0.3 : 1 }}>
          <Pressable
            onPress={takePicture}
            disabled={maxImagesReached ? true : false}
            style={({ pressed }) => [pressed && !maxImagesReached ? { opacity: 0.6 } : null]}
          >
            <View
              style={[s.takeImageButtonRing, { backgroundColor: setLightOrDark(COLORS.zinc[500], COLORS.zinc[400]) }]}
            >
              <View
                style={[
                  s.takeImageButton,
                  {
                    backgroundColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
                    borderColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
                  },
                ]}
              >
                <Ionicons name="paw" size={36} color={COLORS.zinc[400]} />
              </View>
            </View>
          </Pressable>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {!images.length && imageChangeLoading ? (
            <ActivityIndicator size="small" color={COLORS.zinc[500]} testID="image-change-loading-spinner" />
          ) : null}
          {images.length && onNextButtonPress ? (
            <>
              <Pressable
                style={({ pressed }) => [pressed && { opacity: 0.6 }, { paddingLeft: 24, marginBottom: 6 }]}
                onPress={onNextButtonPress}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={getImageUri(images[0])}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]),
                    }}
                  />
                  <Entypo
                    name="chevron-small-right"
                    size={36}
                    color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[100])}
                  />
                </View>
              </Pressable>
              <MaxImagesMessage
                isProfileImage={false}
                maxImagesReached={maxImagesReached}
                maxImages={MAX_IMAGES}
                imagesCount={images.length}
              />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default CameraFooter;

const s = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 1,
    paddingTop: 4,
  },
  takeImageButtonRing: {
    padding: 4,
    borderRadius: 50,
  },
  takeImageButton: {
    height: 90,
    width: 90,
    borderRadius: 100,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 1,
  },
});
