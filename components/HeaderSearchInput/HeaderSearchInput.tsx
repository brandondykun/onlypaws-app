import React from "react";
import { StyleSheet, Platform } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import TextInput from "../TextInput/TextInput";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  placeholder: string;
};

const HeaderSearchInput = ({ value, onChangeText, onSubmitEditing, placeholder }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <TextInput
      inputStyle={[
        s.modalSearchInput,
        {
          backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]),
          borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
        },
      ]}
      rootStyle={{ width: Platform.OS === "ios" ? "80%" : "70%", marginTop: Platform.OS === "ios" ? -4 : 4 }}
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
    />
  );
};

export default HeaderSearchInput;

const s = StyleSheet.create({
  modalSearchInput: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 7,
    fontSize: 18,
    height: 40,
  },
});
