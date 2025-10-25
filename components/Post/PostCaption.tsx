import React, { useState, useEffect } from "react";
import { View, StyleSheet, StyleProp, TextStyle, ViewStyle, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

type Props = {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  caption: string;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  moreTextStyle?: StyleProp<TextStyle>;
  lessTextStyle?: StyleProp<TextStyle>;
  expandable?: boolean;
};

const PostCaption = ({
  caption,
  numberOfLines = 2,
  style,
  textStyle,
  moreTextStyle,
  lessTextStyle,
  isExpanded,
  setIsExpanded,
  expandable = true,
}: Props) => {
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [fullTextHeight, setFullTextHeight] = useState(0);
  const [truncatedTextHeight, setTruncatedTextHeight] = useState(0);

  // Check if text needs truncation by measuring both full and truncated text
  const onFullTextLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setFullTextHeight(height);
  };

  const onTruncatedTextLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setTruncatedTextHeight(height);
  };

  // Show "more" button if full text is taller than truncated text
  useEffect(() => {
    if (fullTextHeight > 0 && truncatedTextHeight > 0) {
      setShowMoreButton(fullTextHeight > truncatedTextHeight);
    }
  }, [fullTextHeight, truncatedTextHeight]);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  if (!caption || caption.trim() === "") {
    return null;
  }

  // If not expandable, just show the full caption without any interaction
  if (!expandable) {
    return (
      <View style={[s.container, style]}>
        <Text style={[s.text, textStyle]}>{caption}</Text>
      </View>
    );
  }

  return (
    <View style={[s.container, style]}>
      {/* Hidden text to measure full height */}
      <Text style={[s.hiddenText, textStyle]} onLayout={onFullTextLayout}>
        {caption}
      </Text>

      {/* Hidden truncated text to measure truncated height */}
      <Text
        style={[s.hiddenText, textStyle]}
        numberOfLines={numberOfLines}
        onLayout={onTruncatedTextLayout}
        testID="post-caption-hidden-text"
      >
        {caption}
      </Text>

      {/* Visible text - pressable to expand/collapse */}
      <Pressable
        onPress={toggleExpansion}
        style={({ pressed }) => [{ opacity: pressed && showMoreButton ? 0.6 : 1 }, s.textTouchable]}
        hitSlop={10}
      >
        <Text style={[s.text, textStyle]} numberOfLines={isExpanded ? 0 : numberOfLines}>
          {caption}
        </Text>
      </Pressable>

      {/* Show more/less button */}
      {showMoreButton && (
        <Pressable
          onPress={toggleExpansion}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, s.moreButton]}
          hitSlop={10}
          testID="post-caption-more-button"
        >
          <Text style={[s.moreText, isExpanded ? lessTextStyle : moreTextStyle]}>
            {isExpanded ? "show less" : "view more"}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default PostCaption;

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  hiddenText: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    left: 8,
    right: 8,
  },
  textTouchable: {
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  moreText: {
    fontSize: 14,
    color: COLORS.zinc[500],
    fontWeight: "500",
  },
});
