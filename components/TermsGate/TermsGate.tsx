import React, { ReactNode, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { acceptTerms } from "@/api/legal";
import TermsAgreement from "@/components/TermsAgreement/TermsAgreement";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useCurrentTerms } from "@/hooks/useCurrentTerms";
import Text from "@/shared/ui/Text/Text";
import toast from "@/utils/toast";

type TermsGateProps = {
  children: ReactNode;
};

const TermsGate = ({ children }: TermsGateProps) => {
  const { isDarkMode } = useColorMode();
  const { data: terms, isLoading, isError } = useCurrentTerms();
  const insets = useSafeAreaInsets();
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!terms) return;
    setAccepting(true);
    const { error } = await acceptTerms(terms.id);
    if (error) {
      toast.error("Failed to accept terms. Please try again.");
      setAccepting(false);
      return;
    }
    setAccepted(true);
    setAccepting(false);
  };

  // Keep splash screen visible while checking
  if (isLoading) {
    return null;
  }

  // If API fails, don't block the app
  if (isError) {
    return <>{children}</>;
  }

  if (terms && !terms.has_accepted && !accepted) {
    return (
      <ScrollView
        contentContainerStyle={[
          s.container,
          {
            backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[100],
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={s.content}>
          <View style={s.header}>
            <Text style={s.title} darkColor={COLORS.sky[400]} lightColor={COLORS.sky[500]}>
              Updated Terms of Service
            </Text>
            <Text style={s.subtitle} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              We've updated our Terms of Service. Please review and accept to continue using OnlyPaws.
            </Text>
          </View>

          <TermsAgreement
            termsContent={terms.content}
            onAccept={handleAccept}
            loading={accepting}
            buttonText="Accept & Continue"
          />
        </View>
      </ScrollView>
    );
  }

  return <>{children}</>;
};

export default TermsGate;

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    gap: 32,
    minHeight: 350,
  },
  header: {
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
});
