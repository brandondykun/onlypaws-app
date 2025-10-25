import React from "react";
import { IContentLoaderProps } from "react-content-loader";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { Dimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  showTwoButtons?: boolean;
  props?: IContentLoaderProps;
};

// svg skeleton to mimic profile details header during loading state

const ProfileDetailsHeaderSkeleton = ({ showTwoButtons, ...props }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const { isDarkMode } = useColorMode();

  const bgColor = isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200]; // tile color
  const highlightColor = isDarkMode ? COLORS.zinc[800] : COLORS.zinc[400]; // swiping tile highlight color

  const circleRadius = 64;

  const oneFifthWidth = screenWidth / 5;
  const oneThirdWidth = screenWidth / 3;

  return (
    <ContentLoader
      speed={1}
      width={screenWidth}
      height={435}
      viewBox={`0 0 ${screenWidth} ${435}`}
      backgroundColor={bgColor}
      foregroundColor={highlightColor}
      {...props}
    >
      {/* Profile image  */}
      <Circle cx={screenWidth / 2} cy="80" r={circleRadius} />

      {/* Name text  */}
      <Rect x={screenWidth / 3} y={circleRadius + 80 + 16} rx="15" ry="15" width={screenWidth / 3} height="24" />

      {/* About text - 3 lines  */}
      <Rect
        x={oneThirdWidth / 2}
        y={circleRadius + 120 + 18}
        rx="8"
        ry="8"
        width={screenWidth - oneThirdWidth}
        height="12"
      />
      <Rect
        x={oneFifthWidth / 2}
        y={circleRadius + 120 + 38}
        rx="8"
        ry="8"
        width={screenWidth - oneFifthWidth}
        height="12"
      />
      <Rect
        x={oneThirdWidth / 2}
        y={circleRadius + 120 + 58}
        rx="8"
        ry="8"
        width={screenWidth - oneThirdWidth}
        height="12"
      />

      {/* Pet type and Breed text  */}
      <Rect x={screenWidth / 4} y={circleRadius + 120 + 92} rx="8" ry="8" width={screenWidth / 2} height="12" />

      {/* Follow Button for other Profiles or Saved Posts and Edit Profile buttons for own Profile  */}
      {showTwoButtons ? (
        <>
          <Rect x={15} y={circleRadius + 120 + 134} rx="8" ry="8" width={screenWidth / 2 - 22} height="36" />
          <Rect
            x={screenWidth / 2 + 7}
            y={circleRadius + 120 + 134}
            rx="8"
            ry="8"
            width={screenWidth / 2 - 22}
            height="36"
          />
        </>
      ) : (
        <Rect x="24" y={circleRadius + 120 + 134} rx="8" ry="8" width={screenWidth - 48} height="36" />
      )}

      {/* Posts label and count  */}
      <Rect x={oneThirdWidth / 2 - 9} y={circleRadius + 120 + 200} rx="8" ry="8" width={18} height="18" />
      <Rect x={oneThirdWidth / 2 - 30} y={circleRadius + 120 + 224} rx="8" ry="8" width={60} height="12" />

      {/* Followers label and count  */}
      <Rect x={screenWidth / 2 - 9} y={circleRadius + 120 + 200} rx="8" ry="8" width={18} height="18" />
      <Rect x={screenWidth / 2 - 30} y={circleRadius + 120 + 224} rx="8" ry="8" width={60} height="12" />

      {/* Following  label and count  */}
      <Rect
        x={screenWidth - oneThirdWidth + oneThirdWidth / 2 - 9}
        y={circleRadius + 120 + 200}
        rx="8"
        ry="8"
        width={18}
        height="18"
      />
      <Rect
        x={screenWidth - oneThirdWidth + oneThirdWidth / 2 - 30}
        y={circleRadius + 120 + 224}
        rx="8"
        ry="8"
        width={60}
        height="12"
      />
    </ContentLoader>
  );
};

export default ProfileDetailsHeaderSkeleton;
