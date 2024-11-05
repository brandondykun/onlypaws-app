import Ionicons from "@expo/vector-icons/Ionicons";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { CameraCapturedPicture } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ImagePickerAsset } from "expo-image-picker";
import { useState, useRef, useEffect } from "react";
import { Dimensions, View, Pressable, TouchableOpacity, FlatList } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { COLORS } from "@/constants/Colors";

import ImageLoader from "../ImageLoader/ImageLoader";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

import DeleteImageModal from "./DeleteImageModal";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  images: (CameraCapturedPicture | ImagePickerAsset)[];
  setImages: React.Dispatch<React.SetStateAction<(CameraCapturedPicture | ImagePickerAsset)[]>>;
  initialIndex?: number | null;
};

const ImagePreviewModal = ({ visible, setVisible, images, setImages, initialIndex }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList<CameraCapturedPicture | ImagePickerAsset>>(null);

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
    <Modal visible={visible} onRequestClose={() => setVisible(false)} withScroll={false}>
      <View style={{ flex: 1, paddingTop: 70 }}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Ionicons name="chevron-back-outline" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={{ opacity: 0.8, fontSize: 18 }}>Long press to delete image.</Text>
        </View>
        <FlatList
          ref={flatListRef}
          contentContainerStyle={{ paddingBottom: 24, gap: 24 }}
          data={images}
          keyExtractor={(item) => item.uri}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginBottom: 16, marginTop: 8 }} key={item.uri}>
                <Text style={{ fontSize: 24, paddingLeft: 8, color: COLORS.zinc[600], marginBottom: 6 }}>
                  Image {index + 1}
                </Text>
                <Pressable
                  onLongPress={() => {
                    setSelectedImageUri(item.uri);
                    Haptics.impactAsync();
                  }}
                >
                  <View style={{ overflow: "hidden", backgroundColor: COLORS.zinc[900] }}>
                    <GestureHandlerRootView>
                      <Zoomable>
                        <ImageLoader
                          uri={item.uri}
                          width={screenWidth}
                          height={screenWidth}
                          style={[
                            item.uri === selectedImageUri ? { borderColor: "red" } : { borderColor: "transparent" },
                            { borderWidth: 1 },
                          ]}
                        />
                      </Zoomable>
                    </GestureHandlerRootView>
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
