import { BottomSheetBackdrop, BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback } from "react";
import { Keyboard, View, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  confirmDeleteCommentModalRef: React.RefObject<RNBottomSheetModal | null>;
  deleteLoading: boolean;
  handleDeleteComment: () => Promise<void>;
  onDismiss: () => void;
};

const ConfirmDeleteCommentModal = ({
  confirmDeleteCommentModalRef,
  deleteLoading,
  handleDeleteComment,
  onDismiss,
}: Props) => {
  const { isDarkMode } = useColorMode();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={isDarkMode ? 0.2 : 0.3}
        onPress={() => {
          onDismiss();
          Keyboard.dismiss();
        }}
        {...props}
      />
    ),
    [onDismiss, isDarkMode],
  );

  return (
    <BottomSheetModal
      handleTitle="Confirm Delete"
      ref={confirmDeleteCommentModalRef}
      enableDynamicSizing={true}
      snapPoints={[]}
      stackBehavior="push"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200] }}
    >
      <BottomSheetView style={[s.bottomSheetView, { paddingHorizontal: 36 }]}>
        <Text style={s.primaryText}>Do you want to delete this comment?</Text>
        <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.secondaryText}>
          You cannot undo this action.
        </Text>
        <View style={s.buttonsContainer}>
          <View style={s.buttonContainer}>
            <Button
              text="Cancel"
              onPress={() => {
                onDismiss();
                confirmDeleteCommentModalRef.current?.dismiss();
              }}
              disabled={deleteLoading}
            />
          </View>
          <View style={s.buttonContainer}>
            <Button
              text="Delete"
              buttonStyle={{ backgroundColor: COLORS.red[600] }}
              onPress={handleDeleteComment}
              loading={deleteLoading}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ConfirmDeleteCommentModal;

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
    marginBottom: 36,
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
