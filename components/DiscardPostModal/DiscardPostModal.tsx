import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { View } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";

import Button from "../Button/Button";

type Props = {
  onDiscard: () => void;
};

const DiscardPostModal = forwardRef(({ onDiscard }: Props, ref: ForwardedRef<RNBottomSheetModal> | undefined) => {
  return (
    <BottomSheetModal handleTitle="Discard Post" ref={ref} snapPoints={[]} enableDynamicSizing={true}>
      <BottomSheetView style={{ padding: 24, paddingBottom: 64, gap: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          Are you sure you want to discard this post? It will not be saved.
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "center", paddingTop: 16, gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Button
              text="Cancel"
              onPress={() => {
                if (typeof ref === "object") {
                  ref?.current?.dismiss();
                }
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Button
              buttonStyle={{ backgroundColor: COLORS.red[600] }}
              text="Discard"
              onPress={() => {
                if (typeof ref === "object") {
                  onDiscard();
                  ref?.current?.dismiss();
                }
              }}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

DiscardPostModal.displayName = "DiscardPostModal";

export default DiscardPostModal;
