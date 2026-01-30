import React from "react";
import { View, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  text: string;
};

const InfoPill = ({ text }: Props) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View
      style={[
        s.root,
        {
          backgroundColor: setLightOrDark(COLORS.zinc[50], `${COLORS.sky[950]}b3`),
        },
      ]}
    >
      <Text style={s.text}>{text}</Text>
    </View>
  );
};

export default InfoPill;

const s = StyleSheet.create({
  root: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});
