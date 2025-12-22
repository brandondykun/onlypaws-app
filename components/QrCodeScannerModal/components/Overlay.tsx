import { Canvas, DiffRect, Group, Mask, rect, RoundedRect, rrect, Rect } from "@shopify/react-native-skia";
import React from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const INNER_SIZE = 300;
const RADIUS = 24; // matches clear window
const STROKE_WIDTH = 6;
const STROKE_WIDTH_HALF = STROKE_WIDTH / 2;

type Props = {
  isScanning: boolean;
  isError: boolean;
};

export const Overlay = ({ isScanning, isError }: Props) => {
  const { width, height } = useWindowDimensions();
  const { setLightOrDark, isDarkMode } = useColorMode();

  const x = width / 2 - INNER_SIZE / 2;
  const y = height / 2 - INNER_SIZE / 2;

  const outer = rrect(rect(0, 0, width, height), 0, 0);
  const inner = rrect(rect(x, y, INNER_SIZE, INNER_SIZE), RADIUS, RADIUS);

  // Gap between the 4 rounded edge borders
  const OUTLINE_GAP = 90;

  const STROKE_COLOR = isScanning
    ? setLightOrDark(COLORS.lime[600], COLORS.lime[500])
    : setLightOrDark(COLORS.sky[600], COLORS.sky[600]);

  const ERROR_STROKE_COLOR = setLightOrDark(COLORS.red[600], COLORS.red[500]);

  return (
    <Canvas style={Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFill}>
      {/* Dimmed overlay */}
      <DiffRect
        inner={inner}
        outer={outer}
        color={setLightOrDark(COLORS.zinc[100], COLORS.zinc[950])}
        opacity={isDarkMode ? 0.7 : 0.3}
        strokeWidth={STROKE_WIDTH}
        strokeCap="round"
      />
      <Mask
        mask={
          <Group>
            <Rect x={0} y={0} width={width / 2 - OUTLINE_GAP} height={height / 2 - OUTLINE_GAP} opacity={0.5} />
            <Rect
              x={0}
              y={height / 2 + OUTLINE_GAP}
              width={width / 2 - OUTLINE_GAP}
              height={height / 2 - OUTLINE_GAP}
              opacity={0.5}
            />
            <Rect
              x={width / 2 + OUTLINE_GAP}
              y={0}
              width={width / 2 - OUTLINE_GAP}
              height={height / 2 - OUTLINE_GAP}
              opacity={0.5}
            />
            <Rect
              x={width / 2 + OUTLINE_GAP}
              y={height / 2 + OUTLINE_GAP}
              width={width / 2 - OUTLINE_GAP}
              height={height / 2 - OUTLINE_GAP}
              opacity={0.5}
            />
          </Group>
        }
      >
        <RoundedRect
          x={x - STROKE_WIDTH_HALF}
          y={y - STROKE_WIDTH_HALF}
          width={INNER_SIZE + STROKE_WIDTH}
          height={INNER_SIZE + STROKE_WIDTH}
          r={RADIUS + STROKE_WIDTH_HALF} // This prop sets the corner radius
          color={isError ? ERROR_STROKE_COLOR : STROKE_COLOR}
          style="stroke"
          strokeWidth={STROKE_WIDTH}
          strokeCap="round"
        />
      </Mask>
    </Canvas>
  );
};
