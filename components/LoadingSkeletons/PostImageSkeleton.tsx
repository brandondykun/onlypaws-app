import React from "react";
import { IContentLoaderProps } from "react-content-loader";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  props?: IContentLoaderProps;
};

// svg skeleton to mimic a post image while the image is loading
// this should be brief, but might be longer on bad connections

const PostImageSkeleton = ({ ...props }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const { isDarkMode } = useColorMode();

  const bgColor = isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300]; // tile color
  const highlightColor = isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200]; // swiping tile highlight color

  return (
    <ContentLoader
      speed={1}
      width={screenWidth}
      height={screenWidth}
      viewBox={`0 0 ${screenWidth} ${screenWidth}`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      <Rect x="0" y="0" rx="0" ry="0" width={screenWidth} height={screenWidth} />
    </ContentLoader>
  );
};

export default PostImageSkeleton;
