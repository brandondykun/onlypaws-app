import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { Image } from "expo-image";
import { useState } from "react";
import { ImageStyle, StyleProp, useWindowDimensions, View } from "react-native";

import PostImageSkeleton from "../LoadingSkeletons/PostImageSkeleton";

type Props = {
  uri: string;
  width?: number;
  height?: number;
  setShowTagPopovers?: React.Dispatch<React.SetStateAction<boolean>>;
  style?: StyleProp<ImageStyle>;
};

const ImageLoader = ({ uri, width, height, setShowTagPopovers, style }: Props) => {
  const [loading, setLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();

  return (
    <View style={{ width: width ? width : screenWidth, height: height ? height : screenWidth, position: "relative" }}>
      {loading ? <PostImageSkeleton /> : null}

      <Zoomable onInteractionStart={() => setShowTagPopovers && setShowTagPopovers(false)}>
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
