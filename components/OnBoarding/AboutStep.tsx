import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import Button from "@/shared/ui/Button/Button";
import TextInput from "@/shared/ui/TextInput/TextInput";

type AboutStepProps = {
  onSubmit: () => Promise<boolean>;
  loading: boolean;
  name: string;
  about: string;
  setAbout: (about: string) => void;
  aboutError: string;
  setAboutError: (error: string) => void;
};

const AboutStep = ({ onSubmit, loading, name, about, setAbout, aboutError, setAboutError }: AboutStepProps) => {
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
    // Call API first, only fade out on success
    const success = await onSubmit();
    if (success) {
      setIsTransitioning(true);
      await fadeOut();
    }
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={{ paddingBottom: 24, gap: 16 }}>
        <Text
          style={{ fontSize: 26, fontWeight: "600", textAlign: "center" }}
          darkColor={COLORS.sky[400]}
          lightColor={COLORS.sky[500]}
        >
          You're Almost Done...
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: "300", textAlign: "center" }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          Tell everyone a bit about {name || "your pet"}!
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <TextInput
          label="About (optional)"
          value={about}
          onChangeText={(val) => {
            setAbout(val);
            if (aboutError) setAboutError("");
          }}
          multiline
          numberOfLines={8}
          placeholder="I am a great dog and I really love cheese..."
          textAlignVertical="top"
          maxLength={1000}
          showCharCount
          inputStyle={{ minHeight: 100 }}
          error={aboutError}
        />
      </View>

      <Button text="Next" onPress={handleSubmit} loading={loading || isTransitioning} />
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
