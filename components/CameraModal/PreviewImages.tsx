import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

import Text from "../Text/Text";

type Props = {
  images: (PhotoFile | ImagePicker.ImagePickerAsset)[];
  setPreviewModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const PreviewImages = ({ images, setPreviewModalVisible }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View style={s.previewImagesContainer}>
      <Text style={s.previewImageHelpText}>{images.length > 1 ? "Tap image to remove or reorder" : ""}</Text>
      {images.length ? (
        <Pressable onPress={() => setPreviewModalVisible(true)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ height: 100 }}>
            {images.map((image) => {
              return <Image source={{ uri: getImageUri(image) }} style={s.previewImage} key={getImageUri(image)} />;
            })}
          </ScrollView>
        </Pressable>
      ) : (
        <View style={{ flexDirection: "row", gap: 2, paddingLeft: 4 }}>
          <View style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]} />
          <View style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]} />
          <View style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]} />
          <View style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]} />
        </View>
      )}
    </View>
  );
};

export default PreviewImages;

const s = StyleSheet.create({
  placeholder: {
    borderRadius: 4,
    height: 100,
    width: 100,
  },
  previewImagesContainer: {
    flex: 1,
    paddingBottom: 4,
    justifyContent: "flex-end",
  },
  previewImage: {
    borderRadius: 4,
    marginHorizontal: 2,
    height: 100,
    width: 100,
  },
  previewImageHelpText: {
    color: COLORS.zinc[500],
    paddingLeft: 4,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: "300",
  },
});
