import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  active: boolean;
  disabled: boolean;
  onPress: () => void;
  postId: number;
};

const DogVisionButton = ({ active, disabled, onPress, postId }: Props) => {
  const { isDarkMode } = useColorMode();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && s.pressed, s.root]}
      hitSlop={10}
      disabled={disabled}
      testID={`post-dog-vision-button-${postId}-${active}`}
    >
      <Ionicons
        name={active ? "glasses" : "glasses-outline"}
        size={30}
        color={active ? COLORS.sky[500] : isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]}
      />
    </Pressable>
  );
};

export default DogVisionButton;

const s = StyleSheet.create({
  root: {
    marginHorizontal: 2,
    marginVertical: -6,
  },
  pressed: {
    opacity: 0.6,
  },
});
