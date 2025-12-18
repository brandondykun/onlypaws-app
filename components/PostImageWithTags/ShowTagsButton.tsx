import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useRef, useMemo } from "react";
import { Pressable, StyleSheet, View, Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { COLORS } from "@/constants/Colors";

type Props = {
  postId: number | string;
  showTagPopovers: boolean;
  setShowTagPopovers: React.Dispatch<React.SetStateAction<boolean>>;
  onPress?: () => void;
};

const ShowTagsButton = ({ postId, showTagPopovers, setShowTagPopovers, onPress }: Props) => {
  const animatedValue = useRef(new Animated.Value(showTagPopovers ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: showTagPopovers ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showTagPopovers, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [`${COLORS.zinc[800]}E6`, `${COLORS.sky[900]}E6`],
  });

  // Wrap in a blocking tap gesture to prevent parent gesture from firing
  const blockingTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .onEnd(() => {
          if (onPress) {
            onPress();
          } else {
            setShowTagPopovers((prev) => !prev);
          }
        }),
    [onPress, setShowTagPopovers],
  );

  return (
    <View style={s.root}>
      <GestureDetector gesture={blockingTapGesture}>
        <Pressable hitSlop={10} testID={`show-tags-button-${postId}`}>
          {({ pressed }) => (
            <Animated.View style={[s.pressable, { backgroundColor }]}>
              <AntDesign name="tag" size={15} color={showTagPopovers ? COLORS.zinc[100] : COLORS.zinc[300]} />
            </Animated.View>
          )}
        </Pressable>
      </GestureDetector>
    </View>
  );
};

export default ShowTagsButton;

const s = StyleSheet.create({
  root: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  pressable: {
    paddingTop: 2,
    height: 28,
    width: 28,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
});
