import {
  Pressable,
  View,
  Text,
  PressableProps,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  useColorScheme,
  ColorSchemeName,
  GestureResponderEvent,
  Platform,
} from "react-native";

import { COLORS } from "@/constants/Colors";

type ButtonType = "primary" | "secondary" | "text" | "outline";

type Props = {
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonType;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  text: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onPress: (event: GestureResponderEvent) => void;
  loadingIconSize?: number;
  loadingIconScale?: number;
} & PressableProps;

const Button = ({
  loading,
  disabled,
  text,
  buttonStyle,
  textStyle,
  icon,
  onPress,
  loadingIconSize,
  loadingIconScale = 1,
  iconPosition = "left",
  variant = "primary",
  ...rest
}: Props) => {
  const colorScheme = useColorScheme();
  const styles = getButtonStyles(colorScheme, variant);

  return (
    <Pressable
      style={({ pressed }) => [pressed && !loading && { opacity: 0.6 }, (disabled || loading) && { opacity: 0.6 }]}
      onPress={disabled || loading ? null : onPress}
      testID="button-pressable"
      {...rest}
    >
      <View style={[styles.root, buttonStyle]}>
        {!loading ? (
          <>
            {icon && iconPosition === "left" ? icon : null}
            <Text style={[styles.text, textStyle]}>{text}</Text>
            {icon && iconPosition === "right" ? icon : null}
          </>
        ) : (
          <ActivityIndicator
            size={loadingIconSize ? loadingIconSize : "small"}
            color={variant === "primary" ? COLORS.zinc[900] : COLORS.zinc[300]}
            testID="button-loading-spinner"
            style={{ transform: [{ scale: Platform.OS === "ios" ? loadingIconScale : 1 }] }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default Button;

const getButtonStyles = (colorScheme: ColorSchemeName, variant: ButtonType) => {
  if (colorScheme === "dark") {
    return darkModeButtonStyles[variant];
  }
  return buttonStyles[variant];
};

const sharedRootStyles: StyleProp<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  height: 40,
  borderRadius: 8,
  gap: 6,
};

const sharedTextStyles: StyleProp<TextStyle> = {
  fontSize: 18,
};

type ButtonStyles = {
  [K in ButtonType]: {
    root: StyleProp<ViewStyle>;
    text: StyleProp<TextStyle>;
  };
};

const buttonStyles: ButtonStyles = {
  primary: {
    root: {
      backgroundColor: COLORS.zinc[900],
      ...sharedRootStyles,
    },
    text: {
      color: COLORS.zinc[200],
      ...sharedTextStyles,
    },
  },
  secondary: {
    root: {
      backgroundColor: COLORS.zinc[300],
      ...sharedRootStyles,
    },
    text: {
      color: COLORS.zinc[900],
      ...sharedTextStyles,
    },
  },
  outline: {
    root: {
      borderColor: COLORS.zinc[500],
      borderWidth: 1,
      ...sharedRootStyles,
    },
    text: {
      color: COLORS.zinc[900],
      ...sharedTextStyles,
    },
  },
  text: {
    root: {
      ...sharedRootStyles,
      alignSelf: "baseline",
    },
    text: {
      color: COLORS.zinc[900],
      textDecorationLine: "underline",
      ...sharedTextStyles,
    },
  },
};

const darkModeButtonStyles: ButtonStyles = {
  primary: {
    root: {
      backgroundColor: COLORS.zinc[200],
      ...sharedRootStyles,
    },
    text: {
      color: COLORS.zinc[900],
      ...sharedTextStyles,
    },
  },
  secondary: {
    root: {
      backgroundColor: COLORS.zinc[600],
      ...sharedRootStyles,
    },
    text: {
      color: COLORS.zinc[50],
      ...sharedTextStyles,
    },
  },
  outline: {
    root: {
      borderColor: COLORS.zinc[500],
      borderWidth: 1,
      ...sharedRootStyles,
    },
    text: {
      color: COLORS.zinc[300],
      ...sharedTextStyles,
    },
  },
  text: {
    root: {
      ...sharedRootStyles,
      alignSelf: "baseline",
    },
    text: {
      color: COLORS.zinc[300],
      textDecorationLine: "underline",
      ...sharedTextStyles,
    },
  },
};
