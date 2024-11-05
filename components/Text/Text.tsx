import { Text as RNText, StyleProp, TextStyle, TextProps } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  darkColor?: string;
  lightColor?: string;
  style?: StyleProp<TextStyle>;
} & TextProps;

const Text = ({ darkColor, lightColor, style, children, ...rest }: Props) => {
  const { isDarkMode } = useColorMode();

  const styles: StyleProp<TextStyle> = {
    color: isDarkMode ? (darkColor ? darkColor : COLORS.zinc[50]) : lightColor ? lightColor : COLORS.zinc[950],
  };

  return (
    <RNText style={[styles, style]} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;
