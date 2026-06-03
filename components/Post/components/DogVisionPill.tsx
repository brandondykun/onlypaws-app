import { Animated, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import Text from "@/shared/ui/Text/Text";

type Props = {
  visible: boolean;
  animation: Animated.Value;
};

const DogVisionPill = ({ visible, animation }: Props) => {
  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.root,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text lightColor={COLORS.zinc[50]} darkColor={COLORS.zinc[50]} style={s.text}>
        Dog Vision
      </Text>
    </Animated.View>
  );
};

export default DogVisionPill;

const s = StyleSheet.create({
  root: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 100,
    borderRadius: 999,
    backgroundColor: `${COLORS.zinc[950]}CC`,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
