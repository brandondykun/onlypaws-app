import { useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";

const WelcomeStep = () => {
  const { isDarkMode } = useColorMode();
  const welcomeFadeAnim = useRef(new Animated.Value(0)).current;
  const toFadeAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
    });
  }, [navigation]);

  useEffect(() => {
    // Staggered fade-in animations with slight delays for quick succession
    Animated.parallel([
      // Welcome text fades in first (no delay)
      Animated.timing(welcomeFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 0,
        useNativeDriver: true,
      }),
      // "to" text fades in second (starts after 250ms)
      Animated.timing(toFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
      // Logo fades in last (starts after 500ms)
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 1500,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [welcomeFadeAnim, toFadeAnim, logoFadeAnim]);

  return (
    <View style={s.container}>
      <View style={s.content}>
        <Animated.View style={{ opacity: welcomeFadeAnim }}>
          <Text style={s.welcomeText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[950]}>
            Welcome
          </Text>
        </Animated.View>
        <Animated.View style={{ opacity: toFadeAnim }}>
          <Text style={s.welcomeText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[950]}>
            to
          </Text>
        </Animated.View>
        <Animated.View style={{ opacity: logoFadeAnim }}>
          <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} width={280} height={70} />
        </Animated.View>
      </View>
    </View>
  );
};

export default WelcomeStep;

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  welcomeText: {
    fontSize: 54,
    fontWeight: "200",
    textAlign: "center",
  },
});
