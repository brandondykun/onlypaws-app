import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { ImagePickerAsset } from "expo-image-picker";
import { forwardRef, ForwardedRef } from "react";
import { StyleSheet, View } from "react-native";
import { PhotoFile } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import Button from "../Button/Button";
import Text from "../Text/Text";

type Props = {
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset)[]>>;
  selectedImageUri: string | null;
  setSelectedImageUri: React.Dispatch<React.SetStateAction<string | null>>;
  closeDeleteImageModal: () => void;
};

const DeleteImageModal = forwardRef(
  (
    { setImages, selectedImageUri, setSelectedImageUri, closeDeleteImageModal }: Props,
    ref: ForwardedRef<RNBottomSheetModal> | undefined,
  ) => {
    const { isDarkMode } = useColorMode();

    const handleDelete = () => {
      setImages((prev) => {
        return prev.filter((image) => {
          return getImageUri(image) !== selectedImageUri;
        });
      });
      setSelectedImageUri(null);
      closeDeleteImageModal();
    };

    const handleCancelPress = () => {
      setSelectedImageUri(null);
      closeDeleteImageModal();
    };

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing={true}
        handleTitle="Delete Image"
        onDismiss={() => setSelectedImageUri(null)}
      >
        <BottomSheetView
          style={[
            s.sheetView,
            {
              backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200],
            },
          ]}
        >
          <Text style={s.confirmText}>Are you sure you want to delete this photo?</Text>
          <View style={s.buttonsContainer}>
            <View style={s.buttonContainer}>
              <Button onPress={handleDelete} buttonStyle={s.deleteButton} text="Delete" />
            </View>
            <View style={s.buttonContainer}>
              <Button onPress={handleCancelPress} text="Cancel" variant="outline" />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

DeleteImageModal.displayName = "DeleteImageModal";
export default DeleteImageModal;

const s = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
    gap: 24,
  },
  buttonContainer: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: COLORS.red[600],
  },
  sheetView: {
    paddingBottom: 64,
    paddingTop: 32,
    paddingHorizontal: 24,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  confirmText: {
    fontSize: 18,
    marginBottom: 32,
  },
});
