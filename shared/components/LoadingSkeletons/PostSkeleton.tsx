import React from "react";
import { IContentLoaderProps } from "react-content-loader";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  props?: IContentLoaderProps;
};

// svg skeleton to mimic a post during loading state

const PostSkeleton = ({ ...props }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const { isDarkMode } = useColorMode();

  const bgColor = isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300]; // tile color
  const highlightColor = isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200]; // swiping tile highlight color

  return (
    <ContentLoader
      speed={1}
      width={screenWidth}
      height={screenWidth + 200}
      viewBox={`0 0 ${screenWidth} ${screenWidth + 200}`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      <Circle cx="25" cy="28" r="16" />
      <Rect x="50" y="20" rx="8" ry="8" width="130" height="15" />
      <Rect x="0" y="50" rx="0" ry="0" width={screenWidth} height={screenWidth} />
      <Rect x="8" y={screenWidth + 65} rx="15" ry="15" width="45" height="28" />
      <Rect x="60" y={screenWidth + 65} rx="15" ry="15" width="45" height="28" />
      <Rect x="8" y={screenWidth + 105} rx="8" ry="8" width="361" height="14" />
      <Rect x="8" y={screenWidth + 125} rx="8" ry="8" width="88" height="14" />
    </ContentLoader>
  );
};

export default PostSkeleton;
