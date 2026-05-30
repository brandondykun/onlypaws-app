import { forwardRef } from "react";
import { Text as RNText, StyleProp, TextStyle, TextProps } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  darkColor?: string;
  lightColor?: string;
  style?: StyleProp<TextStyle>;
} & TextProps;

const Text = forwardRef<RNText, Props>(({ darkColor, lightColor, style, children, ...rest }, ref) => {
  const { isDarkMode } = useColorMode();

  const styles: StyleProp<TextStyle> = {
    color: isDarkMode ? (darkColor ? darkColor : COLORS.zinc[50]) : lightColor ? lightColor : COLORS.zinc[950],
  };

  return (
    <RNText style={[styles, style]} {...rest} ref={ref}>
      {children}
    </RNText>
  );
});

Text.displayName = "Text";
export default Text;
