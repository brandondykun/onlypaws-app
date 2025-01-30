import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { View } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";

import Button from "../Button/Button";

const AiModal = forwardRef((_, ref: ForwardedRef<RNBottomSheetModal> | undefined) => {
  return (
    <BottomSheetModal handleTitle="AI Generated Content" ref={ref} snapPoints={[]} enableDynamicSizing={true}>
      <BottomSheetView style={{ padding: 24, paddingBottom: 48, gap: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          As AI becomes more widely adopted, we feel that it is important to identify when content may have been created
          using generative AI.
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "300" }}>
          OnlyPaws <Text style={{ fontWeight: "500", fontStyle: "italic" }}>does not</Text> prevent or discourage the
          use of AI generated content. We will not automatically label your post as containing AI, so we leave it up to
          the community to be honest and open about the use of generative AI in your content.
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "300" }}>
          In an effort to maintain AI trust and transparency, we ask that you identify if this post contains AI
          generated content.
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

AiModal.displayName = "AiModal";

export default AiModal;
