import Feather from "@expo/vector-icons/Feather";
import { useState, forwardRef, LegacyRef } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  View,
  StyleProp,
  TextStyle,
  Pressable,
} from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  value: string;
  label?: string;
  error?: string;
  inputStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
  onChangeText: ((text: string) => void) | undefined;
  secureTextEntry?: boolean;
} & TextInputProps;

const TextInput = forwardRef(
  (
    { value, label, error, inputStyle, icon, showCharCount, maxLength, onChangeText, secureTextEntry, ...rest }: Props,
    ref: LegacyRef<RNTextInput> | undefined,
  ) => {
    const [focused, setFocused] = useState(false);
    const [textHidden, setTextHidden] = useState(secureTextEntry ? true : false);

    const { isDarkMode } = useColorMode();

    const focusedBorderColor = isDarkMode ? COLORS.zinc[50] : COLORS.zinc[950];

    const handleChangeText = (text: string) => {
      if (onChangeText) {
        if (maxLength) {
          if (text.length <= maxLength) {
            onChangeText(text);
          }
        } else {
          onChangeText(text);
        }
      }
    };

    return (
      <View style={s.root}>
        {label ? (
          <Text
            style={[
              s.label,
              {
                backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
                color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[500],
              },
              focused && { color: focusedBorderColor },
              error ? { color: error ? COLORS.red[600] : COLORS.zinc[600] } : null,
            ]}
          >
            {label}
          </Text>
        ) : null}
        <View style={{ position: "relative" }}>
          {icon ? <View style={s.icon}>{icon}</View> : null}
          <RNTextInput
            ref={ref}
            value={value}
            placeholderTextColor={isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400]}
            {...rest}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              s.input,
              { color: isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900] },
              focused && { borderColor: focusedBorderColor },
              error ? { borderColor: COLORS.red[600] } : null,
              inputStyle,
              icon ? { paddingLeft: 40 } : null,
            ]}
            onChangeText={handleChangeText}
            secureTextEntry={textHidden}
          />
          {secureTextEntry ? (
            <View style={s.eyeIconContainer}>
              {textHidden ? (
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  onPress={() => setTextHidden((prev) => !prev)}
                >
                  <Feather name="eye" size={20} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]} />
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  onPress={() => setTextHidden((prev) => !prev)}
                >
                  <Feather name="eye-off" size={20} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]} />
                </Pressable>
              )}
            </View>
          ) : null}
        </View>

        <View style={s.errorAndTextCountContainer}>
          <Text style={s.errorText}>{error}</Text>
          {showCharCount ? (
            <Text
              style={{
                color:
                  maxLength && value.length >= maxLength
                    ? COLORS.red[500]
                    : isDarkMode
                      ? COLORS.zinc[300]
                      : COLORS.zinc[800],
              }}
            >
              {value.length}/{maxLength}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },
);

TextInput.displayName = "TextInput";
export default TextInput;

const s = StyleSheet.create({
  root: {
    position: "relative",
    paddingTop: 6,
  },
  label: {
    // color: COLORS.zinc[600],
    width: "auto",
    position: "absolute",
    top: 0,
    left: 15,
    zIndex: 2,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  labelError: {
    color: COLORS.red[600],
  },
  input: {
    borderColor: COLORS.zinc[500],
    borderWidth: 1,
    fontSize: 18,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 4,
  },
  inputFocused: {
    borderColor: COLORS.zinc[950],
  },
  inputError: {
    borderColor: COLORS.red[600],
  },
  errorAndTextCountContainer: {
    height: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorText: {
    color: COLORS.red[600],
  },
  icon: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
