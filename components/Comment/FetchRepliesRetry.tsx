import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Button from "../Button/Button";
import Text from "../Text/Text";

type Props = {
  onPress: () => void;
};

const FetchRepliesRetry = ({ onPress }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <View style={{ marginLeft: 12, marginTop: 8 }}>
      <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={{ fontSize: 16, fontWeight: "600" }}>
        There was an error fetching replies.
      </Text>
      <Button
        text="Retry"
        variant="text"
        onPress={onPress}
        buttonStyle={{ marginLeft: 0 }}
        textStyle={{ fontSize: 15 }}
        icon={<Ionicons name="refresh" size={16} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[800]} />}
      />
    </View>
  );
};

export default FetchRepliesRetry;
