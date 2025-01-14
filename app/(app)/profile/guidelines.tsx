import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ScrollView, StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useReportReasonsContext } from "@/context/ReportReasonsContext";

const GuidelinesScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { data: reportReasons } = useReportReasonsContext();
  const { setLightOrDark } = useColorMode();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 18 }]}
    >
      <View style={s.headerContainer}>
        <Text style={s.header}>Community Guidelines</Text>
        <Text style={s.headerText}>
          Thank you for being a member of OnlyPaws! To ensure you enjoy your time here, we've put together some helpful
          information about the app, and how we're working to facilitate a safe, pet friendly environment.
        </Text>
      </View>
      <View style={[s.section, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
        <View
          style={[s.subHeadingContainer, { borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
        >
          <Text lightColor={COLORS.sky[500]} darkColor={COLORS.sky[400]} style={s.subHeading}>
            Content Guidelines
          </Text>
        </View>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          Forgive us for being direct, but if you are looking for another app to post selfies, this is not the app for
          you. There are plenty of other great apps for that purpose.
        </Text>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          Our pets love us unconditionally and they deserve their own platform.
        </Text>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          OnlyPaws was created to give our pets a voice, and to provide a social platform that lifts people up through
          the shared love of our pets.
        </Text>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          We ask that content revolve around your pets and should contain as little human presence as possible.
        </Text>
      </View>

      <View style={[s.section, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
        <View
          style={[s.subHeadingContainer, { borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
        >
          <Text lightColor={COLORS.sky[500]} darkColor={COLORS.sky[400]} style={s.subHeading}>
            Reporting Posts
          </Text>
        </View>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          To create a safe, pet friendly atmosphere on OnlyPaws, we have included the ability to report posts.
        </Text>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          Posts can be reported for the following reasons:
        </Text>
        <View style={{ marginBottom: 24 }}>
          {reportReasons.map((reason) => {
            return (
              <View key={reason.id} style={s.reportReason}>
                <Text style={s.reportReasonName}>- {reason.name}</Text>
                <Text style={s.reportReasonDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
                  {reason.description}
                </Text>
              </View>
            );
          })}
        </View>

        <View>
          <Text style={s.thirdHeading}>How to report a post?</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            You can report a post by pressing on the menu button on the top right of any post and then pressing the
            'Report Post' option. You can report the post for any one of the reasons listed above.
          </Text>
          <Text style={s.thirdHeading}>What happens when you report a post?</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            If a post is reported as <Text style={{ fontStyle: "italic" }}>Inappropriate Content</Text>, the post is
            immediately removed from view, and will not be shown to other users until reviewed by the OnlyPaws team.
            Only use this option when the post contains explicit or highly offensive content.
          </Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            If a post is reported for any reason other than{" "}
            <Text style={{ fontStyle: "italic" }}>Inappropriate Content</Text>, the post will still be shown to other
            users, but the images will be initially hidden and a warning will be displayed.
          </Text>
          <Text style={s.thirdHeading}>How are reports settled?</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            All reported posts will be reviewed by the OnlyPaws team. We will make the final determination on whether
            the report is valid.
          </Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            We will prioritize reports of <Text style={{ fontStyle: "italic" }}>Inappropriate Content</Text>, but will
            work to resolve all reports as quickly as possible.
          </Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            We are a small team, so please be patient in the early stages as we will try our best to resolve reported
            posts in a timely manner.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default GuidelinesScreen;

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    padding: 12,
    paddingTop: 24,
  },
  headerContainer: {
    marginBottom: 42,
  },
  header: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "300",
    paddingHorizontal: 12,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
    borderRadius: 8,
    marginBottom: 24,
  },
  subHeading: {
    fontSize: 20,
    marginBottom: 6,
    fontWeight: "bold",
  },
  subHeadingContainer: {
    borderBottomColor: COLORS.zinc[800],
    borderBottomWidth: 1,
    marginBottom: 18,
  },
  thirdHeading: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  paragraph: {
    fontSize: 16,
    fontWeight: "300",
    marginBottom: 24,
  },
  reportReason: {
    marginBottom: 24,
  },
  reportReasonName: {
    fontSize: 18,
    marginBottom: 4,
  },
  reportReasonDescription: {
    fontSize: 16,
    fontWeight: "300",
    paddingLeft: 12,
  },
});
