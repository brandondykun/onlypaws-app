import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { View, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  onDismiss: () => void;
  modalRef: React.RefObject<RNBottomSheetModal>;
  onSubmit: () => Promise<void>;
  loading: boolean;
  error: string;
};

const EditUsernameModal = ({ username, setUsername, onDismiss, modalRef, onSubmit, loading, error }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <BottomSheetModal handleTitle="Edit Username" ref={modalRef} onDismiss={onDismiss}>
      <BottomSheetView style={s.sheetView}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              marginBottom: 24,
              padding: 12,
              borderRadius: 8,
              backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]),
            }}
          >
            <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 18, fontWeight: "300" }}>
              - Username must be unique among all profiles on OnlyPaws.
            </Text>
            <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 18, fontWeight: "300", marginTop: 12 }}>
              - This is the username visible to other users.
            </Text>
            <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 18, fontWeight: "300", marginTop: 12 }}>
              - Other users can search for your profile by this username.
            </Text>
          </View>
          <Text>Username</Text>
          <TextInput value={username} onChangeText={(val) => setUsername(val)} error={error} autoCapitalize="none" />
        </View>
        <View style={{ marginTop: 36 }}>
          <Button text="Submit" onPress={onSubmit} loading={loading} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default EditUsernameModal;

const s = StyleSheet.create({
  sheetView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
});
