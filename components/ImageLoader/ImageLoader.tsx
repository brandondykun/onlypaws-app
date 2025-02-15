import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Dimensions, ImageStyle, StyleProp, StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  uri: string;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

const ImageLoader = ({ uri, width, height, style }: Props) => {
  const { isDarkMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={{ width: width ? width : screenWidth, height: height ? height : screenWidth, position: "relative" }}>
      {loading ? (
        <View
          style={[
            s.loadingView,
            {
              height: height ? height : screenWidth,
              width: width ? width : screenWidth,
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
            },
          ]}
        >
          <ActivityIndicator size="large" color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]} />
        </View>
      ) : null}

      <Zoomable>
        <Image
          source={{ uri: uri }}
          style={[{ width: width ? width : screenWidth, height: height ? height : screenWidth }, style]}
          onLoadEnd={() => {
            setLoading(false);
          }}
        />
      </Zoomable>
    </View>
  );
};

export default ImageLoader;

const s = StyleSheet.create({
  loadingView: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
