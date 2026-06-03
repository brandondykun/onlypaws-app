import { BottomSheetModal as RNBottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import BottomSheetModal from "@/shared/ui/BottomSheet/BottomSheet";
import Text from "@/shared/ui/Text/Text";

type Props = {
  aboutDogVisionModalRef: React.RefObject<RNBottomSheetModal | null>;
};

const AboutDogVisionModal = ({ aboutDogVisionModalRef }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <BottomSheetModal
      handleTitle="About Dog Vision"
      ref={aboutDogVisionModalRef}
      snapPoints={["80%"]}
      enableDynamicSizing={false}
      backgroundStyle={{ backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }}
    >
      <BottomSheetScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>What is Dog Vision?</Text>
        <Text style={s.body} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Dog Vision is a playful way to preview posts through a color range closer to what many dogs can see. It does
          not recreate every part of a dog's eyesight, but it helps show why certain reds, greens, and bright color
          contrasts may look very different to them.
        </Text>

        <Text style={s.sectionTitle}>How human color vision works</Text>
        <Text style={s.body} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Most people have three types of color-sensitive cone cells in their eyes. These cones respond most strongly to
          short, medium, and long wavelengths, which our brains interpret across the visible spectrum: violet, blue,
          cyan, green, yellow, orange, and red.
        </Text>

        <Text style={s.sectionTitle}>How dogs see color</Text>
        <Text style={s.body} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Dogs usually have two main cone types. Their color world is closer to blue and yellow vision, while many red
          and green tones can look muted, grayish, brownish, or yellowish. A bright red toy in green grass may not pop
          for a dog the same way it does for a person.
        </Text>

        <View
          style={[
            s.spectrumCard,
            {
              backgroundColor: setLightOrDark(COLORS.sky[50], `${COLORS.sky[950]}66`),
              borderColor: setLightOrDark(COLORS.sky[200], COLORS.sky[800]),
            },
          ]}
        >
          <Text style={s.spectrumTitle} darkColor={COLORS.sky[200]} lightColor={COLORS.sky[900]}>
            Visible spectrum
          </Text>
          <Text style={s.spectrumText} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[700]}>
            Humans: violet, blue, cyan, green, yellow, orange, red.
          </Text>
          <Text style={s.spectrumText} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[700]}>
            Dogs: mostly blues and yellows, with reds and greens compressed into less distinct tones.
          </Text>
        </View>

        <Text style={s.sectionTitle}>How to use it</Text>
        <Text style={s.body} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          To turn Dog Vision on for a post, tap the eye button beneath the post or use the Dog Vision option in the post
          menu. Long press any post image as a shortcut to toggle it on or off. You can use it on photos throughout the
          feed whenever you are curious about what details might stand out to your pup.
        </Text>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default AboutDogVisionModal;

const s = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  spectrumCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 18,
  },
  spectrumTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  spectrumText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
});
