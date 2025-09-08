import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { ImagePickerAsset } from "expo-image-picker";
import { useCallback, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image as CropperImage } from "react-native-image-crop-picker";
import { runOnJS } from "react-native-reanimated";
import ReorderableList, { ReorderableListReorderEvent, reorderItems } from "react-native-reorderable-list";
import { PhotoFile } from "react-native-vision-camera";

import Button from "@/components/Button/Button";
import DraggableImage from "@/components/Camera/DraggableImage/DraggableImage";
import Modal from "@/components/Modal/Modal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  images: (PhotoFile | ImagePickerAsset | CropperImage)[];
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset | CropperImage)[]>>;
};

const ReorderImageModal = ({ visible, setVisible, images, setImages }: Props) => {
  const { isDarkMode } = useColorMode();

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    setImages((value) => reorderItems(value, from, to));
  };

  // provide haptic feedback when drag starts
  const handleDragStart = useCallback(() => {
    "worklet";

    runOnJS(Haptics.selectionAsync)();
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      setVisible(false);
    }
  }, [images, setVisible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      withScroll={false}
      backgroundColor={isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50]}
    >
      <View style={{ flex: 1, paddingTop: 54 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
            <Ionicons name="chevron-back-outline" size={30} color={isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900]} />
          </TouchableOpacity>
          <Text
            style={{
              color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600],
              fontSize: 18,
              fontWeight: "400",
              paddingLeft: 12,
            }}
          >
            Drag to reorder
          </Text>
          <Button
            variant="text"
            text="Done"
            onPress={() => setVisible(false)}
            textStyle={{ color: isDarkMode ? COLORS.sky[600] : COLORS.sky[500] }}
            hitSlop={10}
          />
        </View>
        <ReorderableList
          data={images}
          onReorder={handleReorder}
          renderItem={({ item, index }) => <DraggableImage item={item} index={index} setImages={setImages} />}
          keyExtractor={(item) => getImageUri(item)}
          contentContainerStyle={{ paddingBottom: 48, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          onDragStart={handleDragStart}
          shouldUpdateActiveItem
        />
      </View>
    </Modal>
  );
};

export default ReorderImageModal;

const s = StyleSheet.create({
  header: {
    paddingLeft: 12,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
