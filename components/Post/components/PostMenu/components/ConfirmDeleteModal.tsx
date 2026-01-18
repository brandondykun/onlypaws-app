import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { View, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";

type Props = {
  confirmDeleteModalRef: React.RefObject<RNBottomSheetModal | null>;
  deleteLoading: boolean;
  handlePostDelete: () => Promise<void>;
};

const ConfirmDeleteModal = ({ confirmDeleteModalRef, deleteLoading, handlePostDelete }: Props) => {
  return (
    <BottomSheetModal
      handleTitle="Confirm Delete"
      ref={confirmDeleteModalRef}
      enableDynamicSizing={true}
      snapPoints={[]}
    >
      <BottomSheetView style={[s.bottomSheetView, { paddingHorizontal: 36 }]}>
        <Text style={s.primaryText}>Are you sure you want to delete this post?</Text>
        <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.secondaryText}>
          This action cannot be undone.
        </Text>
        <View style={s.buttonsContainer}>
          <View style={s.buttonContainer}>
            <Button text="Cancel" onPress={() => confirmDeleteModalRef.current?.dismiss()} disabled={deleteLoading} />
          </View>
          <View style={s.buttonContainer}>
            <Button
              text="Delete"
              buttonStyle={{ backgroundColor: COLORS.red[600] }}
              onPress={handlePostDelete}
              loading={deleteLoading}
              testID="delete-post-button"
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ConfirmDeleteModal;

const s = StyleSheet.create({
  bottomSheetView: {
    paddingTop: 24,
    paddingBottom: 56,
  },
  primaryText: {
    marginBottom: 8,
    fontSize: 18,
  },
  secondaryText: {
    marginBottom: 24,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  buttonContainer: {
    flex: 1,
  },
});
