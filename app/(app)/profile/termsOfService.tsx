import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useCurrentTerms } from "@/hooks/useCurrentTerms";
import Text from "@/shared/ui/Text/Text";

const TermsOfServiceScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { isDarkMode } = useColorMode();
  const { data: terms, isLoading, isError } = useCurrentTerms();

  const markdownStyles = {
    body: {
      color: isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800],
      fontSize: 16,
      lineHeight: 22,
    },
    heading1: {
      color: isDarkMode ? COLORS.sky[400] : COLORS.sky[600],
      fontSize: 22,
      fontWeight: "700" as const,
      marginBottom: 8,
    },
    heading2: {
      color: isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900],
      fontSize: 20,
      fontWeight: "600" as const,
      marginBottom: 6,
      marginTop: 32,
    },
    heading3: {
      color: isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900],
      fontSize: 16,
      fontWeight: "600" as const,
      marginBottom: 4,
    },
    link: {
      color: isDarkMode ? COLORS.sky[400] : COLORS.sky[600],
    },
    bullet_list: {
      marginBottom: 8,
    },
  };

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="small" color={COLORS.zinc[500]} />
      </View>
    );
  }

  if (isError || !terms) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Unable to load Terms of Service. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 18 }]}
    >
      <View style={s.headerContainer}>
        <Text style={s.headerText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Version {terms.version}
        </Text>
        {terms.accepted_at && (
          <>
            <Text style={s.acceptedText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
              You accepted these terms on:
            </Text>
            <Text style={s.acceptedText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
              {new Date(terms.accepted_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </>
        )}
      </View>
      <Markdown style={markdownStyles}>{terms.content}</Markdown>
    </ScrollView>
  );
};

export default TermsOfServiceScreen;

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    padding: 12,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "300",
    textAlign: "center",
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 18,
    marginBottom: 16,
  },
  acceptedText: {
    fontSize: 18,
    marginBottom: 4,
  },
});
