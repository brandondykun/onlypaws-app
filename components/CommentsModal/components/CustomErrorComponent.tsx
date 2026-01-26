import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  refetch: () => Promise<void>;
};

const CustomErrorComponent = ({ refetch }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <View style={{ paddingHorizontal: 48, paddingBottom: 48, flex: 1, justifyContent: "center" }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600],
        }}
      >
        Uh oh! There was an error fetching those comments.
      </Text>
      <View style={{ paddingTop: 24, alignItems: "center" }}>
        <Button
          text="Retry"
          variant="outline"
          icon={<Ionicons name="refresh-sharp" size={20} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900]} />}
          onPress={refetch}
          buttonStyle={{ paddingHorizontal: 12 }}
        />
      </View>
    </View>
  );
};

export default CustomErrorComponent;
