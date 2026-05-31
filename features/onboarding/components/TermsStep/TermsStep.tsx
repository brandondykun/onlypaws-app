import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

import TermsAgreement from "@/components/TermsAgreement/TermsAgreement";
import { COLORS } from "@/constants/Colors";
import Text from "@/shared/ui/Text/Text";

type TermsStepProps = {
  onAccept: () => Promise<void>;
  loading: boolean;
  termsContent: string;
  termsVersion: string;
};

const TermsStep = ({ onAccept, loading, termsContent, termsVersion }: TermsStepProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={{ paddingBottom: 48, gap: 16 }}>
        <Text
          style={{ fontSize: 26, fontWeight: "600", textAlign: "center" }}
          darkColor={COLORS.sky[400]}
          lightColor={COLORS.sky[500]}
        >
          Terms of Service
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center" }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          By creating an account, you agree to our Terms of Service (v{termsVersion})
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <TermsAgreement termsContent={termsContent} onAccept={onAccept} loading={loading} buttonText="Create Profile" />
      </View>
    </Animated.View>
  );
};

export default TermsStep;

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
});
