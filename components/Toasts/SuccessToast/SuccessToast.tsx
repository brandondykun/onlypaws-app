import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  text1?: string;
  text2?: string;
};

const DARK_BG_COLOR = COLORS.lime[950];
const DARK_BORDER_COLOR = COLORS.lime[600];
const LIGHT_BG_COLOR = COLORS.lime[700];
const LIGHT_BORDER_COLOR = COLORS.lime[400];
const ICON_COLOR = COLORS.zinc[100];
const LIGHT_TEXT_COLOR = COLORS.zinc[100];

const SuccessToast = ({ text1, text2 }: Props) => {
  const { isDarkMode } = useColorMode();

  return (
    <View
      style={{
        width: "90%",
        backgroundColor: isDarkMode ? DARK_BG_COLOR : LIGHT_BG_COLOR,
        padding: 12,
        borderRadius: 6,
        borderColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR,
        borderWidth: 1,
        marginTop: 24,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <View>
        <Ionicons name="checkmark-circle-outline" size={24} color={ICON_COLOR} />
      </View>
      <View style={{ flex: 1 }}>
        <Text lightColor={LIGHT_TEXT_COLOR} style={{ fontSize: 20, marginBottom: 8, fontWeight: "bold" }}>
          {text1}
        </Text>
        <Text lightColor={LIGHT_TEXT_COLOR}>{text2}</Text>
      </View>
    </View>
  );
};

export default SuccessToast;
