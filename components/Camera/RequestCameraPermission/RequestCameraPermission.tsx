import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  requestPermission: () => void;
};

const RequestCameraPermission = ({ requestPermission }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View
      style={[s.requestPermissionsContainer, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={s.message}>We can't wait to see your pets!</Text>
        <Text style={s.message}>But first, we need your permission to access the camera.</Text>
        <View style={{ alignItems: "center" }}>
          <Button
            onPress={requestPermission}
            text="Grant Permission"
            variant="text"
            textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
          />
        </View>
      </View>
      <View style={{ alignItems: "center", paddingBottom: 48 }}>
        <Button onPress={() => router.back()} text="Cancel" variant="text" />
      </View>
    </View>
  );
};

export default RequestCameraPermission;

const s = StyleSheet.create({
  requestPermissionsContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 24,
  },
  message: {
    textAlign: "center",
    paddingBottom: 16,
    fontSize: 18,
    fontWeight: "300",
  },
});
