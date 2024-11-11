import { ImagePickerAsset } from "expo-image-picker";
import { Pressable, View } from "react-native";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

type Props = {
  visible: boolean;
  images: (PhotoFile | ImagePickerAsset)[];
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset)[]>>;
  selectedImageUri: string | null;
  setSelectedImageUri: React.Dispatch<React.SetStateAction<string | null>>;
};

const DeleteImageModal = ({ visible, images, setImages, selectedImageUri, setSelectedImageUri }: Props) => {
  const { isDarkMode } = useColorMode();

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
            backgroundColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[200],
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 32 }}>Are you sure you want to delete this photo?</Text>
          <View style={{ flexDirection: "row", gap: 24 }}>
            <View style={{ flex: 1 }}>
              <Button onPress={handleDelete} buttonStyle={{ backgroundColor: COLORS.red[600] }} text="Delete" />
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={() => setSelectedImageUri(null)} text="Cancel" variant="outline" />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default DeleteImageModal;
