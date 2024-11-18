import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { ImagePickerAsset } from "expo-image-picker";
import { useState, useRef, useEffect } from "react";
import { Dimensions, View, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

import ImageLoader from "../ImageLoader/ImageLoader";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

import DeleteImageModal from "./DeleteImageModal";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  images: (PhotoFile | ImagePickerAsset)[];
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset)[]>>;
  initialIndex?: number | null;
};

const ImagePreviewModal = ({ visible, setVisible, images, setImages, initialIndex }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlashList<PhotoFile | ImagePickerAsset>>(null);

  const { isDarkMode } = useColorMode();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible && initialIndex) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: true,
        });
      }, 100);
    }
  }, [initialIndex, visible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      withScroll={false}
      backgroundColor={isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50]}
    >
      <View style={{ flex: 1, paddingTop: 60 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
            <Ionicons name="chevron-back-outline" size={30} color={isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900]} />
          </TouchableOpacity>
          <Text style={{ opacity: 0.8, fontSize: 18 }}>Long press to delete image.</Text>
        </View>
        <FlashList
          ref={flatListRef}
          contentContainerStyle={{ paddingBottom: 36 }}
          data={images}
          estimatedItemSize={screenWidth + 30}
          keyExtractor={(item) => getImageUri(item)}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginBottom: 16, marginTop: 8 }} key={getImageUri(item)}>
                <Text style={{ fontSize: 24, paddingLeft: 8, color: COLORS.zinc[600], marginBottom: 6 }}>
                  Image {index + 1}
                </Text>
                <Pressable
                  onLongPress={() => {
                    setSelectedImageUri(getImageUri(item));
                    Haptics.impactAsync();
                  }}
                >
                  <View style={{ overflow: "hidden", backgroundColor: COLORS.zinc[900] }}>
                    <ImageLoader
                      uri={getImageUri(item)}
                      width={screenWidth}
                      height={screenWidth}
                      style={[
                        getImageUri(item) === selectedImageUri
                          ? { borderColor: "red" }
                          : { borderColor: "transparent" },
                        { borderWidth: 1 },
                      ]}
                    />
                  </View>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
      <DeleteImageModal
        visible={!!selectedImageUri}
        images={images}
        setImages={setImages}
        selectedImageUri={selectedImageUri}
        setSelectedImageUri={setSelectedImageUri}
      />
    </Modal>
  );
};

export default ImagePreviewModal;

const s = StyleSheet.create({
  header: {
    paddingLeft: 8,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});
