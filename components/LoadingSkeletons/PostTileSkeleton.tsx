import React, { Fragment } from "react";
import { IContentLoaderProps } from "react-content-loader";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  rows?: number;
  props?: IContentLoaderProps;
};

// svg skeleton to mimic post tiles during loading state

const PostTileSkeleton = ({ rows = 6, ...props }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const { isDarkMode } = useColorMode();

  // size of each post tile
  const size = screenWidth / 3; // subtract 2 to account for gap

  const firstPosition = 1; // first position offset
  const secondPosition = size + 2; // second position offset
  const thirdPosition = size * 2 + 1; // third position offset

  // svg area height
  const viewHeight = size * rows + 1 * rows;

  const bgColor = isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200]; // tile color
  const highlightColor = isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300]; // swiping tile highlight color

  // create correctly positioned row for each row in rows prop
  const tiles = [...Array(rows)].map((_, i) => {
    // offset down from top for the entire row
    const y = i === 0 ? 0 : i * size + 1 * i;

    return (
      <Fragment key={i}>
        <Rect x={firstPosition} y={y} rx="0" ry="0" width={size} height={size} />
        <Rect x={secondPosition} y={y} rx="0" ry="0" width={size - 2} height={size} />
        <Rect x={thirdPosition} y={y} rx="0" ry="0" width={size} height={size} />
      </Fragment>
    );
  });

  return (
    <ContentLoader
      speed={1}
      width={screenWidth}
      height={viewHeight}
      viewBox={`0 0 ${screenWidth} ${viewHeight}`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      {tiles}
    </ContentLoader>
  );
};

export default PostTileSkeleton;
