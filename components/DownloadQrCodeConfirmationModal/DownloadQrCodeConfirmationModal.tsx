import Feather from "@expo/vector-icons/Feather";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import Button from "../Button/Button";
import Text from "../Text/Text";

type Props = {
  onSavePress: () => Promise<void>;
  onCancelPress: () => void;
  ref: ForwardedRef<RNBottomSheetModal>;
};

const DownloadQrCodeConfirmationModal = ({ onSavePress, onCancelPress, ref }: Props) => {
  const insets = useSafeAreaInsets();
  const { setLightOrDark } = useColorMode();

  return (
    <BottomSheetModal ref={ref} handleTitle="Save QR Code" snapPoints={[]} enableDynamicSizing={true}>
      <BottomSheetView style={{ ...s.bottomSheet, paddingBottom: insets.bottom + 16 }}>
        <View style={s.textContainer}>
          <Text style={s.mainText}>Do you want to save this QR code to your camera roll?</Text>
          <Text style={s.subText} darkColor={COLORS.zinc[400]}>
            This will allow you to easily share this QR code to help other users find your profile!
          </Text>
        </View>
        <View style={s.buttonsContainer}>
          <View style={{ flex: 1 }}>
            <Button
              text="Save"
              onPress={onSavePress}
              icon={<Feather name="download" size={16} color={setLightOrDark(COLORS.zinc[100], COLORS.zinc[900])} />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button text="Cancel" variant="secondary" onPress={onCancelPress} />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

DownloadQrCodeConfirmationModal.displayName = "DownloadQrCodeConfirmationModal";

export default DownloadQrCodeConfirmationModal;

const s = StyleSheet.create({
  bottomSheet: {
    padding: 16,
    gap: 12,
  },
  textContainer: {
    marginBottom: 24,
    gap: 24,
  },
  mainText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    fontWeight: "300",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
});
