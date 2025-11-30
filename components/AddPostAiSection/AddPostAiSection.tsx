import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { Switch, View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Button from "../Button/Button";
import Text from "../Text/Text";

type Props = {
  aiModalRef: React.RefObject<RNBottomSheetModal | null>;
  aiGenerated: boolean;
  setAiGenerated: (generated: boolean) => void;
};

const AddPostAiSection = ({ aiModalRef, aiGenerated, setAiGenerated }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View style={s.aiGeneratedContainer}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: "400" }}>Contains AI Generated Content</Text>
        <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={{ fontSize: 14, fontWeight: "400" }}>
          Please identify if this post contains AI generated content.{" "}
          <Button
            buttonStyle={s.learnMoreButton}
            textStyle={[s.learnMoreButtonText, { color: setLightOrDark(COLORS.sky[600], COLORS.sky[400]) }]}
            variant="text"
            text="Learn More"
            onPress={() => aiModalRef.current?.present()}
            hitSlop={10}
          />
        </Text>
      </View>
      <Switch value={aiGenerated} onValueChange={setAiGenerated} />
    </View>
  );
};

export default AddPostAiSection;

const s = StyleSheet.create({
  aiGeneratedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 72,
  },
  learnMoreButton: {
    padding: 0,
    margin: 0,
    paddingTop: 0,
    height: "auto",
    marginBottom: -3,
  },
  learnMoreButtonText: {
    fontSize: 14,
    fontWeight: "400",
    textDecorationLine: "none",
  },
});
