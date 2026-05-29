import { View, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import Button from "@/shared/ui/Button/Button";

type Props = {
  onBackButtonPress: () => void;
};

const NoCameraDevice = ({ onBackButtonPress }: Props) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={s.message}>Uh oh! No Camera Device Found.</Text>
      <View style={{ alignItems: "center", paddingBottom: 48 }}>
        <Button onPress={onBackButtonPress} text="Back" variant="text" />
      </View>
    </View>
  );
};

export default NoCameraDevice;

const s = StyleSheet.create({
  message: {
    textAlign: "center",
    paddingBottom: 16,
    fontSize: 18,
    fontWeight: "300",
  },
});
