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
};

const HeaderSearchInput = ({ value, onChangeText, onSubmitEditing, placeholder, rootStyle }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <TextInput
      inputStyle={[
        s.modalSearchInput,
        {
          backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]),
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
      autoFocus={true}
      autoCorrect={false}
      withClearButton={true}
      hideErrorAndTextCount={true}
      testID="header-search-input"
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
