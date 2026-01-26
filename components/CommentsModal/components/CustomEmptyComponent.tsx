import { View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";

const CustomEmptyComponent = () => {
  return (
    <View
      style={{
        paddingHorizontal: 48,
        paddingBottom: 48,
        flex: 1,
        justifyContent: "center",
        gap: 16,
      }}
    >
      <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]} style={{ textAlign: "center", fontSize: 20 }}>
        No comments yet.
      </Text>
      <Text style={{ color: COLORS.zinc[500], textAlign: "center", fontSize: 18 }}>
        Add a comment to start the conversation!
      </Text>
    </View>
  );
};

export default CustomEmptyComponent;
