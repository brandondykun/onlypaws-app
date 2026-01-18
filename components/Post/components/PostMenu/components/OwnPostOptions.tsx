import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ForwardedRef } from "react";
import { View, StyleSheet } from "react-native";

import { ModalCard, ModalCardItemSeparator } from "@/components/ModalCard/ModalCard";
import Pressable from "@/components/Pressable/Pressable";
import Text from "@/components/Text/Text";

type Props = {
  postId: number;
  modalRef: ForwardedRef<RNBottomSheetModal>;
  deleteLoading: boolean;
  handleShowConfirmModal: () => void;
};

const OwnPostOptions = ({ postId, modalRef, deleteLoading, handleShowConfirmModal }: Props) => {
  const handleEditPress = () => {
    router.push(`/(app)/posts/editPost?postId=${postId}`);
    if (typeof modalRef === "object") {
      modalRef?.current?.dismiss();
    }
  };
  return (
    <ModalCard>
      <Pressable onPress={handleEditPress}>
        <View style={[s.profileOption]}>
          <Text style={s.buttonText}>Edit Post</Text>
        </View>
      </Pressable>
      <ModalCardItemSeparator />
      <Pressable
        style={({ pressed }) => [
          pressed && !deleteLoading ? { opacity: 0.5 } : deleteLoading ? { opacity: 0.5 } : null,
        ]}
        onPress={handleShowConfirmModal}
        disabled={deleteLoading}
      >
        <View style={[s.profileOption]}>
          <Text style={s.buttonText}>Delete Post</Text>
        </View>
      </Pressable>
    </ModalCard>
  );
};

export default OwnPostOptions;

const s = StyleSheet.create({
  profileOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
  },
});
