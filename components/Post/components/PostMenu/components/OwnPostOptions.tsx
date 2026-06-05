import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ForwardedRef } from "react";
import { View, StyleSheet } from "react-native";

import { ModalCard, ModalCardItemSeparator } from "@/components/ModalCard/ModalCard";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import Pressable from "@/shared/ui/Pressable/Pressable";
import Text from "@/shared/ui/Text/Text";

type Props = {
  postId: number;
  modalRef: ForwardedRef<RNBottomSheetModal>;
  deleteLoading: boolean;
  handleShowConfirmModal: () => void;
  dogVisionActive: boolean;
  handleToggleDogVision: () => void;
};

const OwnPostOptions = ({
  postId,
  modalRef,
  deleteLoading,
  handleShowConfirmModal,
  dogVisionActive,
  handleToggleDogVision,
}: Props) => {
  const { setLightOrDark } = useColorMode();

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
          <MaterialCommunityIcons
            name="pencil-outline"
            size={18}
            color={setLightOrDark(COLORS.zinc[700], COLORS.zinc[300])}
          />
          <Text style={s.buttonText}>Edit Post</Text>
        </View>
      </Pressable>
      <ModalCardItemSeparator />
      <Pressable onPress={handleToggleDogVision}>
        <View style={s.profileOption}>
          <Ionicons
            name={dogVisionActive ? "glasses" : "glasses-outline"}
            size={26}
            color={setLightOrDark(COLORS.zinc[700], COLORS.zinc[300])}
          />
          <Text style={s.buttonText}>{dogVisionActive ? "View in Human Vision" : "View in Dog Vision"}</Text>
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
        <View style={s.profileOption}>
          <Ionicons name="trash-outline" size={17} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])} />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
  },
});
