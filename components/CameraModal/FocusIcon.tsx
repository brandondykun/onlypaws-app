import { View } from "react-native";
import { Point } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";

type Props = {
  focusPoint: Point;
};

const SIZE = 80;
const CROSS_HAIR_SIZE = 6;
const COLOR = COLORS.amber[400];

const FocusIcon = ({ focusPoint }: Props) => {
  return (
    <View
      style={{
        zIndex: 3,
        height: SIZE,
        width: SIZE,
        borderColor: COLOR,
        borderWidth: 1,
        position: "absolute",
        top: focusPoint.y - SIZE / 2,
        left: focusPoint.x - SIZE / 2,
      }}
    >
      <View style={{ position: "relative", flex: 1 }}>
        <View
          style={{
            position: "absolute",
            backgroundColor: COLOR,
            height: CROSS_HAIR_SIZE,
            width: 1,
            top: 0, // top crosshair
            left: SIZE / 2 - 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: COLOR,
            height: CROSS_HAIR_SIZE,
            width: 1,
            bottom: 0, // bottom crosshair
            left: SIZE / 2 - 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: COLOR,
            height: 1,
            width: CROSS_HAIR_SIZE,
            left: 0, // left crosshair
            top: SIZE / 2 - 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            backgroundColor: COLOR,
            height: 1,
            width: CROSS_HAIR_SIZE,
            right: 0, // right crosshair
            top: SIZE / 2 - 1,
          }}
        />
      </View>
    </View>
  );
};

export default FocusIcon;
