import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Button from "../Button/Button";
import Text from "../Text/Text";

// Footer component for when a fetch fails during scroll.
// Displays a message and a button to retry the fetch.

type Props = {
  fetchFn: () => void;
  message: string;
  buttonText: string;
};
const RetryFetchFooter = ({ fetchFn, message, buttonText }: Props) => {
  const { setLightOrDark, isDarkMode } = useColorMode();
  return (
    <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 24 }}>
      <Text
        style={{
          color: setLightOrDark(COLORS.zinc[700], COLORS.zinc[400]),
          textAlign: "center",
          fontSize: 16,
          fontWeight: isDarkMode ? "300" : "400",
          marginBottom: 8,
        }}
      >
        {message}
      </Text>
      <Button
        text={buttonText}
        variant="text"
        onPress={fetchFn}
        textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
        icon={<Ionicons name="refresh-outline" size={18} color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />}
        buttonStyle={{ marginLeft: -20 }}
      />
    </View>
  );
};

export default RetryFetchFooter;
