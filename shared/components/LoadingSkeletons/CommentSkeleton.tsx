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

// svg skeleton to mimic a comment during loading state

const CommentSkeleton = ({ rows = 10, ...props }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const { isDarkMode } = useColorMode();

  const bgColor = isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400]; // tile color
  const highlightColor = isDarkMode ? COLORS.zinc[600] : COLORS.zinc[300]; // swiping tile highlight color

  // create correctly positioned row for each row in rows prop
  const tiles = [...Array(rows)].map((_, i) => {
    // offset down from top for the entire row

    return (
      <Fragment key={i}>
        <Rect x={screenWidth - 30} y={80 * i + 18} rx="8" ry="8" width="20" height="15" />
        <Rect x="12" y={80 * i + 17} rx="4" ry="4" width="65" height="8" />
        <Rect x="12" y={80 * i + 30} rx="7" ry="7" width={screenWidth * 0.6} height="12" />
        <Rect x="12" y={80 * i + 55} rx="7" ry="7" width={35} height="9" />
      </Fragment>
    );
  });

  return (
    <ContentLoader
      speed={1}
      width={screenWidth}
      height={600}
      viewBox={`0 0 ${screenWidth} 600`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      {tiles}
    </ContentLoader>
  );
};

export default CommentSkeleton;
