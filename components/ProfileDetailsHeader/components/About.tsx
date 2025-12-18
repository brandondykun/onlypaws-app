import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import CollapsibleText from "../../CollapsibleText/CollapsibleText";

type Props = {
  aboutText: string | null;
};

const About = ({ aboutText }: Props) => {
  const [aboutExpanded, setAboutExpanded] = useState(false);

  if (!aboutText) return null;

  return (
    <View style={s.root}>
      <CollapsibleText
        caption={aboutText}
        numberOfLines={4}
        isExpanded={aboutExpanded}
        setIsExpanded={setAboutExpanded}
        textStyle={s.text}
      />
    </View>
  );
};

export default About;

const s = StyleSheet.create({
  root: {
    marginBottom: 24,
  },
  text: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
  },
});
