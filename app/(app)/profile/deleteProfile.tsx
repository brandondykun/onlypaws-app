import { ScrollView, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";

const DeleteProfileScreen = () => {
  return (
    <ScrollView style={s.root}>
      <Text style={{ fontSize: 24, textAlign: "center", marginTop: 12 }}>Coming Soon</Text>
    </ScrollView>
  );
};

export default DeleteProfileScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
  },
});
