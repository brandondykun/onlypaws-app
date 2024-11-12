import { useState, useRef } from "react";
import { Pressable, View, Animated, NativeSyntheticEvent, TextLayoutEventData, Text as RNText } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

type Props = {
  caption: string;
};

const LINE_HEIGHT = 20;

const PostCaption = ({ caption }: Props) => {
  const [lines, setLines] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const animatedHeight = useRef(new Animated.Value(LINE_HEIGHT)).current;
  const textRef = useRef<RNText>(null);

  const handleLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    setLines(event.nativeEvent.lines.length);
  };

  const handleExpand = () => {
    setExpanded(true);
    Animated.timing(animatedHeight, {
      toValue: LINE_HEIGHT * lines,
      duration: 300,
      useNativeDriver: false, // Required for layout animations
    }).start();
  };

  return (
    <View style={{ padding: 16, paddingBottom: 8 }}>
      <Pressable onPress={lines > 1 ? handleExpand : null} hitSlop={8}>
        <Animated.View style={{ height: animatedHeight }}>
          <View style={{ flexDirection: "row", width: "auto" }}>
            <Text ref={textRef} onTextLayout={handleLayout} style={{ lineHeight: LINE_HEIGHT, flex: 1 }}>
              {caption}
            </Text>
            {lines > 1 && !expanded ? <Text style={{ color: COLORS.zinc[500] }}>...more</Text> : null}
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default PostCaption;
