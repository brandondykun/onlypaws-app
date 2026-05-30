import React from "react";
import { IContentLoaderProps } from "react-content-loader";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  props?: IContentLoaderProps;
};

// svg skeleton to mimic profile details header during loading state

const ProfileDetailsHeaderSkeleton = ({ ...props }: Props) => {
  const { isDarkMode } = useColorMode();

  const bgColor = isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300]; // tile base color
  const highlightColor = isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200]; // animated moving highlight color

  const SCREEN_WIDTH = Dimensions.get("window").width;
  const HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;

  // The circular profile image radius
  const CIRCLE_RADIUS = 54;
  const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;

  const PADDING = 16;
  const HALF_PADDING = PADDING / 2;

  // Where the about text starts vertically
  const ABOUT_TEXT_START_Y = CIRCLE_RADIUS + 78;

  // Where the name and stats start horizontally
  const START_OF_STATS_X = CIRCLE_DIAMETER + PADDING + 20;
  // The remaining screen that the stats can use to space out
  const REMAINING = SCREEN_WIDTH - START_OF_STATS_X - PADDING;
  const STAT_WIDTH = REMAINING / 3;

  return (
    <ContentLoader
      speed={1}
      width={SCREEN_WIDTH}
      height={366}
      viewBox={`0 0 ${SCREEN_WIDTH} ${366}`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      {/* Profile image  */}
      <Circle cx={CIRCLE_RADIUS + PADDING} cy={CIRCLE_RADIUS + PADDING} r={CIRCLE_RADIUS} />

      {/* Name text  */}
      <Rect x={START_OF_STATS_X} y={PADDING + 15} rx="7" ry="7" width={SCREEN_WIDTH / 4} height="14" />

      {/* Posts label and count  */}
      <Rect x={START_OF_STATS_X} y={PADDING + 61} rx="9" ry="9" width={18} height="18" />
      <Rect x={START_OF_STATS_X} y={PADDING + 84} rx="5" ry="5" width={36} height="10" />

      {/* Followers label and count  */}
      <Rect x={START_OF_STATS_X + STAT_WIDTH - 8} y={PADDING + 61} rx="9" ry="9" width={18} height="18" />
      <Rect x={START_OF_STATS_X + STAT_WIDTH - 8} y={PADDING + 84} rx="5" ry="5" width={60} height="10" />

      {/* Following  label and count  */}
      <Rect x={START_OF_STATS_X + STAT_WIDTH * 2 - 4} y={PADDING + 61} rx="9" ry="9" width={18} height="18" />
      <Rect x={START_OF_STATS_X + STAT_WIDTH * 2 - 4} y={PADDING + 84} rx="5" ry="5" width={60} height="10" />

      {/* About text - 4 lines and show more button  */}
      <Rect x={PADDING} y={ABOUT_TEXT_START_Y + 18} rx="8" ry="8" width={SCREEN_WIDTH - 40} height="12" />
      <Rect x={PADDING} y={ABOUT_TEXT_START_Y + 36} rx="8" ry="8" width={SCREEN_WIDTH - 32} height="12" />
      <Rect x={PADDING} y={ABOUT_TEXT_START_Y + 54} rx="8" ry="8" width={SCREEN_WIDTH - 32} height="12" />
      <Rect x={PADDING} y={ABOUT_TEXT_START_Y + 72} rx="8" ry="8" width={SCREEN_WIDTH - 64} height="12" />
      <Rect x={PADDING} y={ABOUT_TEXT_START_Y + 94} rx="8" ry="8" width={60} height="10" />

      {/* Pet type pill  */}
      <Rect x={PADDING} y={CIRCLE_RADIUS + 120 + 90} rx="12" ry="12" width={50} height="24" />

      {/* Pet Breed pill  */}
      <Rect x={74} y={CIRCLE_RADIUS + 120 + 90} rx="12" ry="12" width={180} height="24" />

      {/* Bottom buttons - Either follow/unfollow or saved posts and tagged posts buttons */}
      <Rect
        x={PADDING}
        y={CIRCLE_RADIUS + 120 + 142}
        rx="6"
        ry="6"
        width={HALF_SCREEN_WIDTH - PADDING - HALF_PADDING}
        height="36"
      />
      <Rect
        x={HALF_SCREEN_WIDTH + HALF_PADDING}
        y={CIRCLE_RADIUS + 120 + 142}
        rx="6"
        ry="6"
        width={HALF_SCREEN_WIDTH - PADDING - HALF_PADDING}
        height="36"
      />
    </ContentLoader>
  );
};

export default ProfileDetailsHeaderSkeleton;
