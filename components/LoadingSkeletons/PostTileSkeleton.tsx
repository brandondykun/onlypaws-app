import React from "react";
import { IContentLoaderProps } from "react-content-loader";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  props?: IContentLoaderProps;
};

// svg skeleton to mimic post tiles during loading state

const PostTileSkeleton = ({ ...props }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const { isDarkMode } = useColorMode();

  // size of each post tile
  const size = screenWidth / 3 - 2; // subtract 2 to account for gap

  const firstPosition = 0; // first position offset
  const secondPosition = size + 2; // second position offset
  const thirdPosition = size * 2 + 2 * 2; // third position offset
  const fourthPosition = size * 3 + 2 * 3; // fourth position offset

  // svg area height
  const viewHeight = fourthPosition + size;

  const bgColor = isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200]; // tile color
  const highlightColor = isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300]; // swiping tile highlight color

  return (
    <ContentLoader
      speed={2}
      width={screenWidth}
      height={fourthPosition + size}
      viewBox={`0 0 ${screenWidth} ${viewHeight}`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      <Rect x={firstPosition} y={firstPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={secondPosition} y={firstPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={thirdPosition} y={firstPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={firstPosition} y={secondPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={secondPosition} y={secondPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={thirdPosition} y={secondPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={firstPosition} y={thirdPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={secondPosition} y={thirdPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={thirdPosition} y={thirdPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={firstPosition} y={fourthPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={secondPosition} y={fourthPosition} rx="0" ry="0" width={size} height={size} />
      <Rect x={thirdPosition} y={fourthPosition} rx="0" ry="0" width={size} height={size} />
    </ContentLoader>
  );
};

export default PostTileSkeleton;
