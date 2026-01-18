import { View, ViewProps } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = ViewProps & {
  children: React.ReactNode;
};

// Card that can be used on modals for buttons and other UI elements
const ModalCard = ({ children, style, ...rest }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View
      style={[
        {
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[800]),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

// Separator that can be used between items on a ModalCard
const ModalCardItemSeparator = ({ style, ...rest }: ViewProps) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View
      style={[{ height: 1, backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[700]) }, style]}
      {...rest}
    />
  );
};

export { ModalCard, ModalCardItemSeparator };
