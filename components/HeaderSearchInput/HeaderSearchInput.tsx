import React from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import TextInput from "../TextInput/TextInput";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  placeholder: string;
  rootStyle?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  disabled?: boolean;
};

const HeaderSearchInput = ({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder,
  rootStyle,
  autoFocus = true,
  disabled = false,
}: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <TextInput
      inputStyle={[
        s.modalSearchInput,
        {
          backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]),
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      rootStyle={[{ width: "100%", marginTop: 0, paddingTop: 0, paddingRight: 0 }, rootStyle]}
      placeholderTextColor={COLORS.zinc[500]}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      returnKeyType="search"
      autoCapitalize="none"
      autoFocus={autoFocus}
      autoCorrect={false}
      withClearButton={true}
      hideErrorAndTextCount={true}
      testID="header-search-input"
      editable={!disabled}
    />
  );
};

export default HeaderSearchInput;

const s = StyleSheet.create({
  modalSearchInput: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 0,
    paddingTop: 0,
    fontSize: 18,
    height: 44,
    width: "100%",
  },
});
