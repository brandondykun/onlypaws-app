import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";

type AboutStepProps = {
  onSubmit: () => Promise<void>;
  loading: boolean;
  name: string;
  about: string;
  setAbout: (about: string) => void;
};

const AboutStep = ({ onSubmit, loading, name, about, setAbout }: AboutStepProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }, [fadeAnim]);

  const handleSubmit = async () => {
    // Disable button during fade out to prevent re-clicking
    setIsTransitioning(true);
    await fadeOut();
    await onSubmit();
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={{ paddingBottom: 24, gap: 16 }}>
        <Text
          style={{ fontSize: 24, fontWeight: "600", textAlign: "center" }}
          darkColor={COLORS.sky[400]}
          lightColor={COLORS.sky[500]}
        >
          One Last Thing...
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: "300", textAlign: "center" }}
          darkColor={COLORS.zinc[300]}
          lightColor={COLORS.zinc[700]}
        >
          Tell everyone a bit about {name || "your pet"}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <TextInput
          label="About (optional)"
          value={about}
          onChangeText={setAbout}
          multiline
          numberOfLines={8}
          placeholder="Tell us about your pet..."
          textAlignVertical="top"
          maxLength={1000}
          showCharCount
          inputStyle={{ minHeight: 100 }}
        />
      </View>

      <Button text="Create Profile" onPress={handleSubmit} loading={loading || isTransitioning} />
    </Animated.View>
  );
};

export default AboutStep;

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
});
