import { ActivityIndicator } from "react-native";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";

const LoadingFooter = () => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="small" />
    </View>
  );
};

export default LoadingFooter;
