import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { View } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";

import Button from "../Button/Button";

const PostAiModal = forwardRef((_, ref: ForwardedRef<RNBottomSheetModal> | undefined) => {
  return (
    <BottomSheetModal handleTitle="AI Generated Content" ref={ref} snapPoints={[]} enableDynamicSizing={true}>
      <BottomSheetView style={{ padding: 24, paddingBottom: 48, gap: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>This post contains AI generated content.</Text>
        <Text style={{ fontSize: 16, fontWeight: "300" }}>
          This post has been identified as containing AI generated content.
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

PostAiModal.displayName = "PostAiModal";

export default PostAiModal;
