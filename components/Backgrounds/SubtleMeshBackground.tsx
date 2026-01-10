import { MeshGradientView } from "expo-mesh-gradient";
import { StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const SubtleMeshBackground = () => {
  const { isDarkMode } = useColorMode();

  const colors = isDarkMode
    ? [
        COLORS.zinc[900],
        COLORS.zinc[900],
        COLORS.zinc[900],
        COLORS.zinc[950],
        COLORS.zinc[950],
        COLORS.zinc[950],
        COLORS.zinc[900],
        COLORS.zinc[900],
        COLORS.zinc[900],
      ]
    : [
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
        COLORS.zinc[200],
      ];

  return (
    <MeshGradientView
      rows={3}
      columns={3}
      colors={colors}
      points={[
        [0.0, 0.0],
        [0.5, 0.0],
        [1.0, 0.0],
        [0.0, 0.5],
        [0.5, 0.5],
        [1.0, 0.5],
        [0.0, 1.0],
        [0.5, 1.0],
        [1.0, 1.0],
      ]}
      style={StyleSheet.absoluteFillObject}
    />
  );
};

export default SubtleMeshBackground;
