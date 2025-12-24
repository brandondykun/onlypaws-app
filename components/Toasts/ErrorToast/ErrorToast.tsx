import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  text1?: string;
  text2?: string;
};

const DARK_BG_COLOR = COLORS.red[950];
const DARK_BORDER_COLOR = COLORS.red[600];
const DARK_TEXT_COLOR = COLORS.zinc[100];

const LIGHT_BG_COLOR = COLORS.red[100];
const LIGHT_BORDER_COLOR = COLORS.red[300];
const LIGHT_TEXT_COLOR = COLORS.red[950];

const ErrorToast = ({ text1, text2 }: Props) => {
  const { isDarkMode } = useColorMode();

  return (
    <View
      style={{
        width: "90%",
        backgroundColor: isDarkMode ? DARK_BG_COLOR : LIGHT_BG_COLOR,
        padding: 12,
        borderRadius: 12,
        borderColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR,
        borderWidth: 1,
        marginTop: 24,
        flexDirection: "row",
        gap: 12,
        zIndex: 1000000000,
      }}
    >
      <View>
        <MaterialIcons name="error-outline" size={26} color={isDarkMode ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR} />
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

export default ErrorToast;
