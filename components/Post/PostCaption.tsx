import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, StyleProp, TextStyle, ViewStyle } from "react-native";

import Text from "../Text/Text";
import { COLORS } from "@/constants/Colors";

type Props = {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  caption: string;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  moreTextStyle?: StyleProp<TextStyle>;
  lessTextStyle?: StyleProp<TextStyle>;
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
      <TouchableOpacity onPress={toggleExpansion} activeOpacity={0.8} style={s.textTouchable}>
        <Text style={[s.text, textStyle]} numberOfLines={isExpanded ? 0 : numberOfLines}>
          {caption}
        </Text>
      </TouchableOpacity>

      {/* Show more/less button */}
      {showMoreButton && (
        <TouchableOpacity
          onPress={toggleExpansion}
          style={s.moreButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="post-caption-more-button"
        >
          <Text style={[s.moreText, isExpanded ? lessTextStyle : moreTextStyle]}>
            {isExpanded ? "show less" : "view more"}
          </Text>
        </TouchableOpacity>
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
