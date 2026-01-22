import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { View } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";

import Button from "../Button/Button";

const PrivateProfileModal = forwardRef((_, ref: ForwardedRef<RNBottomSheetModal> | undefined) => {
  return (
    <BottomSheetModal handleTitle="Private Profile" ref={ref} snapPoints={[]} enableDynamicSizing={true}>
      <BottomSheetView style={{ padding: 24, paddingBottom: 48, gap: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          To protect your privacy, you can make your profile private.
        </Text>
        <Text style={{ fontSize: 16 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          When your profile is private, only your followers can see your posts, and your content won’t appear on the
          Explore page.
        </Text>
        <Text style={{ fontSize: 16 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          People can still search for and view your profile, but they won’t be able to see your posts unless you approve
          their follow request.
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "center", paddingTop: 16 }}>
          <Button
            variant="text"
            text="Close"
            onPress={() => {
              if (typeof ref === "object") {
                ref?.current?.dismiss();
              }
            }}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

PrivateProfileModal.displayName = "PrivateProfileModal";

export default PrivateProfileModal;
