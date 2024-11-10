import { ImagePickerAsset } from "expo-image-picker";
import { Pressable, View, Text } from "react-native";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { getImageUri } from "@/utils/utils";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";

type Props = {
  visible: boolean;
  images: (PhotoFile | ImagePickerAsset)[];
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset)[]>>;
  selectedImageUri: string | null;
  setSelectedImageUri: React.Dispatch<React.SetStateAction<string | null>>;
};

const DeleteImageModal = ({ visible, images, setImages, selectedImageUri, setSelectedImageUri }: Props) => {
  const handleDelete = () => {
    setImages((prev) => {
      return prev.filter((image) => {
        return getImageUri(image) !== selectedImageUri;
      });
    });
    setSelectedImageUri(null);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setSelectedImageUri(null)}
      withScroll={false}
      style={{ flex: 1, alignItems: "flex-end" }}
      animationType="slide"
      raw
      transparent={true}
    >
      <Pressable
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}
        onPress={() => setSelectedImageUri(null)}
      >
        <View
          style={{
            paddingBottom: 64,
            paddingTop: 32,
            paddingHorizontal: 24,
            backgroundColor: "#171717",
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 32, color: COLORS.zinc[200] }}>
            Are you sure you want to delete this photo?
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={{ flex: 1 }}>
              <Button onPress={handleDelete} buttonStyle={{ backgroundColor: COLORS.lime[600] }} text="Yes" />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                onPress={() => setSelectedImageUri(null)}
                buttonStyle={{ backgroundColor: COLORS.red[700] }}
                text="Cancel"
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default DeleteImageModal;
