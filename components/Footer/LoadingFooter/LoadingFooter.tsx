import { ActivityIndicator } from "react-native";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";

// basic activity indicator footer that can be used in a list when loading more data

const LoadingFooter = () => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="small" />
    </View>
  );
};

export default LoadingFooter;
