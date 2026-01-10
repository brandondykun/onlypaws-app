import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  rest?: ViewProps;
};

const FeedbackCard = ({ children, style, ...rest }: Props) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View
      style={{
        backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[900]),
        borderColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 28,
        ...(style as ViewStyle),
      }}
      {...rest}
    >
      {children}
    </View>
  );
};

export default FeedbackCard;
