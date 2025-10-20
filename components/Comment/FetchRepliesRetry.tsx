import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  onPress: () => void;
};

const FetchRepliesRetry = ({ onPress }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={onPress} hitSlop={8}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center", width: 50 }}>
        <Ionicons name="refresh" size={13} color={isDarkMode ? COLORS.red[500] : COLORS.zinc[800]} />
        <Text darkColor={COLORS.red[500]} style={{ fontSize: 13, textDecorationLine: "underline" }}>
          Retry
        </Text>
      </View>
    </Pressable>
  );
};

export default FetchRepliesRetry;
