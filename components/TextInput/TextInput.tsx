import Feather from "@expo/vector-icons/Feather";
import { useState, forwardRef, LegacyRef, useEffect, useRef } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  View,
  StyleProp,
  TextStyle,
  Pressable,
  ViewStyle,
  Animated,
} from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  value?: string;
  label?: string;
  error?: string;
  inputStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
  onChangeText: ((text: string) => void) | undefined;
  secureTextEntry?: boolean;
  withClearButton?: boolean;
  rootStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

const TextInput = forwardRef(
  (
    {
      value,
      label,
      error,
      inputStyle,
      icon,
      showCharCount,
      maxLength,
      onChangeText,
      secureTextEntry,
      rootStyle,
      withClearButton = false,
      ...rest
    }: Props,
    ref: LegacyRef<RNTextInput> | undefined,
  ) => {
    const [focused, setFocused] = useState(false);
    const [textHidden, setTextHidden] = useState(secureTextEntry ? true : false);

    // Animated value for clear button position
    const clearButtonTranslateX = useRef(new Animated.Value(withClearButton && value ? 0 : 40)).current;

    const { setLightOrDark } = useColorMode();

    const focusedBorderColor = setLightOrDark(COLORS.zinc[600], COLORS.zinc[400]);

    // Animate clear button based on input value
    useEffect(() => {
      if (withClearButton) {
        const shouldShow = value && value.length > 0;

        if (shouldShow) {
          // Spring in animation - snappy and responsive
          Animated.spring(clearButtonTranslateX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        } else {
          // Spring out animation - first pull left, then spring out right
          Animated.sequence([
            Animated.timing(clearButtonTranslateX, {
              toValue: -5, // Pull slightly to the left first
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.spring(clearButtonTranslateX, {
              toValue: 40, // Then spring out to the right (slower)
              tension: 60,
              friction: 10,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    }, [value, withClearButton, clearButtonTranslateX]);

    const handleChangeText = (text: string) => {
      if (onChangeText) {
        onChangeText(text);
      }
    };

    // handle clear button press
    const handleClear = () => {
      if (onChangeText) {
        onChangeText("");
      }
    };

    return (
      <View style={[s.root, rootStyle]}>
        {label ? (
          <Text
            style={[
              s.label,
              {
                color: setLightOrDark(COLORS.zinc[600], COLORS.zinc[400]),
              },
              focused && { color: setLightOrDark(COLORS.zinc[950], COLORS.zinc[300]) },
              error ? { color: error ? COLORS.red[600] : COLORS.zinc[600] } : null,
            ]}
          >
            {label}
          </Text>
        ) : null}
        <View style={{ position: "relative", overflow: "hidden" }}>
          {icon ? <View style={s.icon}>{icon}</View> : null}
          {withClearButton ? (
            <Animated.View
              style={[
                s.clearButtonContainer,
                {
                  transform: [{ translateX: clearButtonTranslateX }],
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  s.clearButton,
                  { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleClear}
                testID="input-clear-button"
              >
                <Feather name="x" size={18} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])} />
              </Pressable>
            </Animated.View>
          ) : null}
          <RNTextInput
            ref={ref}
            value={value}
            placeholderTextColor={setLightOrDark(COLORS.zinc[500], COLORS.zinc[600])}
            {...rest}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={maxLength}
            style={[
              s.input,
              {
                color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]),
                backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
                borderColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
              },
              focused && { borderColor: focusedBorderColor },
              error ? { borderColor: COLORS.red[600] } : null,
              inputStyle,
              icon ? { paddingLeft: 40 } : null,
              withClearButton ? { paddingRight: 40 } : null,
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
                  testID="input-show-text-button"
                >
                  <Feather name="eye" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])} />
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  onPress={() => setTextHidden((prev) => !prev)}
                  testID="input-hide-text-button"
                >
                  <Feather name="eye-off" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])} />
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
                  maxLength && value && value.length >= maxLength
                    ? COLORS.red[500]
                    : setLightOrDark(COLORS.zinc[800], COLORS.zinc[300]),
              }}
            >
              {value ? value.length : 0}/{maxLength}
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
    width: "auto",
    paddingLeft: 6,
    zIndex: 2,
    paddingHorizontal: 4,
    fontSize: 13,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  labelError: {
    color: COLORS.red[600],
  },
  input: {
    borderWidth: 1,
    fontSize: 18,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
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
    zIndex: 2,
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
  clearButton: {
    borderRadius: 100,
    padding: 4,
  },
  clearButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
});
