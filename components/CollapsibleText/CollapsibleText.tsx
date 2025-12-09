import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, StyleProp, TextStyle, ViewStyle, Pressable, Animated } from "react-native";

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

const ANIMATION_DURATION_FAST = 200;
const ANIMATION_DURATION_MEDIUM = 300;
const ANIMATION_DURATION_SLOW = 500;

// Minimum height difference (in pixels) to consider text as truncatable
const TRUNCATION_THRESHOLD = 2;

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
  const [hasInitializedHeight, setHasInitializedHeight] = useState(false);
  // Controls which text version is visible - swapped at START of animation to prevent text reflow
  const [showFullText, setShowFullText] = useState(false);

  const animatedHeight = useRef(new Animated.Value(0)).current;

  const onFullTextLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setFullTextHeight(height);
  };

  const onTruncatedTextLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setTruncatedTextHeight(height);
  };

  // Always update showMoreButton when measurements change
  useEffect(() => {
    if (fullTextHeight > 0 && truncatedTextHeight > 0) {
      const needsTruncation = fullTextHeight > truncatedTextHeight + TRUNCATION_THRESHOLD;
      setShowMoreButton(needsTruncation);
    }
  }, [fullTextHeight, truncatedTextHeight]);

  // Initialize animated height once measurements are available
  useEffect(() => {
    if (fullTextHeight > 0 && truncatedTextHeight > 0 && !hasInitializedHeight) {
      const initialHeight = isExpanded ? fullTextHeight : truncatedTextHeight;

      animatedHeight.setValue(initialHeight);
      setHasInitializedHeight(true);
      setShowFullText(isExpanded);
    }
  }, [fullTextHeight, truncatedTextHeight, hasInitializedHeight, isExpanded, animatedHeight]);

  // Animate height when isExpanded changes (after initialization)
  useEffect(() => {
    if (!hasInitializedHeight || fullTextHeight === 0 || truncatedTextHeight === 0) return;

    const targetHeight = isExpanded ? fullTextHeight : truncatedTextHeight;

    // Immediately swap the visible text at the START of the animation
    // This prevents text reflow/jumping during the animation because:
    // - On expand: full text is shown immediately (clipped by container), then container animates open
    // - On collapse: truncated text is shown immediately (fits in current height), then container animates closed
    setShowFullText(isExpanded);

    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration:
        fullTextHeight > 300
          ? ANIMATION_DURATION_SLOW
          : fullTextHeight > 150
            ? ANIMATION_DURATION_MEDIUM
            : ANIMATION_DURATION_FAST,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, hasInitializedHeight, fullTextHeight, truncatedTextHeight, animatedHeight]);

  const toggleExpansion = () => {
    if (expandable && fullTextHeight > truncatedTextHeight + TRUNCATION_THRESHOLD) {
      setIsExpanded(!isExpanded);
    }
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
      <Text style={[s.text, s.hiddenText, textStyle]} onLayout={onFullTextLayout}>
        {caption}
      </Text>

      {/* Hidden truncated text to measure truncated height */}
      <Text
        style={[s.text, s.hiddenText, textStyle]}
        numberOfLines={numberOfLines}
        onLayout={onTruncatedTextLayout}
        testID="post-caption-hidden-text"
      >
        {caption}
      </Text>

      {/* Animated container that clips content - height controlled by animation */}
      <Pressable onPress={toggleExpansion} style={s.textTouchable} hitSlop={10}>
        <Animated.View style={[s.animatedContainer, hasInitializedHeight && { height: animatedHeight }]}>
          {/* Truncated text - in document flow, visible when collapsed */}
          <Text style={[s.text, textStyle, showFullText && s.hiddenInPlace]} numberOfLines={numberOfLines}>
            {caption}
          </Text>

          {/* Full text - absolutely positioned, visible when expanded */}
          {showFullText && <Text style={[s.text, s.absoluteText, textStyle]}>{caption}</Text>}
        </Animated.View>
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
      </Pressable>
    </View>
  );
};

export default PostCaption;

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 12,
  },
  hiddenText: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    left: 0,
    right: 0,
  },
  // Hidden but still takes up space in document flow (for maintaining touchable area)
  hiddenInPlace: {
    opacity: 0,
  },
  textTouchable: {
    alignSelf: "flex-start",
  },
  animatedContainer: {
    overflow: "hidden",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Full text positioned absolutely on top of truncated text
  absoluteText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
