import { ScrollView, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";

const ChangeEmailScreen = () => {
  return (
    <ScrollView style={s.root}>
      <Text style={{ fontSize: 24, textAlign: "center", marginTop: 12 }}>Coming Soon</Text>
    </ScrollView>
  );
};

export default ChangeEmailScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
  },
});
