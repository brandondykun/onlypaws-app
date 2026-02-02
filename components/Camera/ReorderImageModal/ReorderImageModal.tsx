import * as Haptics from "expo-haptics";
import { useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import ReorderableList, { ReorderableListReorderEvent, reorderItems } from "react-native-reorderable-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import Button from "@/components/Button/Button";
import DraggableImage from "@/components/Camera/DraggableImage/DraggableImage";
import Modal from "@/components/Modal/Modal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ImageAssetWithTags } from "@/types/post/post";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  images: ImageAssetWithTags[];
  setImages: React.Dispatch<React.SetStateAction<ImageAssetWithTags[]>>;
};

const ReorderImageModal = ({ visible, setVisible, images, setImages }: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    setImages((value) => reorderItems(value, from, to));
  };

  // provide haptic feedback when drag starts
  const handleDragStart = useCallback(() => {
    "worklet";

    scheduleOnRN(Haptics.selectionAsync);
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
      backgroundColor={setLightOrDark(COLORS.zinc[50], COLORS.zinc[950])}
      animationType="slide"
    >
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <View style={s.header}>
          <View style={{ position: "absolute", left: 12, top: 0 }}>
            <Button
              variant="text"
              text="Done"
              onPress={() => setVisible(false)}
              buttonStyle={{ height: "auto", paddingHorizontal: 8 }}
              textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]), fontSize: 20, marginTop: -2 }}
              hitSlop={10}
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Drag to reorder
          </Text>
        </View>
        <ReorderableList
          data={images}
          onReorder={handleReorder}
          renderItem={({ item, index }) => <DraggableImage item={item} index={index} setImages={setImages} />}
          keyExtractor={(item) => item.id}
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
});
