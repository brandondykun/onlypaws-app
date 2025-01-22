import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ScrollView, StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const AboutScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { setLightOrDark } = useColorMode();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 18 }]}
    >
      <View style={s.headerContainer}>
        <Text style={s.header}>About</Text>
        <Text style={s.headerText}>Here is some information on how OnlyPaws works!</Text>
      </View>
      <View style={[s.section, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
        <View
          style={[s.subHeadingContainer, { borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
        >
          <Text lightColor={COLORS.sky[500]} darkColor={COLORS.sky[400]} style={s.subHeading}>
            About OnlyPaws
          </Text>
        </View>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          OnlyPaws was started in 2024, with a single purpose. Create a social media style platform, that provides guilt
          free scrolling.
        </Text>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          While traditional social media is nearly inescapable, it can be exhausting!!! It often causes frustration and
          can negatively impact your mental health. In the sea of influencers, click bait, and drama, OnlyPaws offers a
          beacon of positivity. It strives to provide not only entertainment, but also an environment that makes a
          positive impact on your mental health!
        </Text>
      </View>

      <View style={[s.section, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
        <View
          style={[s.subHeadingContainer, { borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
        >
          <Text lightColor={COLORS.sky[500]} darkColor={COLORS.sky[400]} style={s.subHeading}>
            App Tour
          </Text>
        </View>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          OnlyPaws has 5 tabs, each with a distinct purpose:
        </Text>
        <View>
          <View style={s.listItemContainer}>
            <Text style={s.bulletedItem}>- Feed Tab</Text>
            <Text style={s.bulletDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              The Feed tab shows posts from profiles that you follow.
            </Text>
          </View>
          <View style={s.listItemContainer}>
            <Text style={s.bulletedItem}>- Explore Tab</Text>
            <Text style={s.bulletDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              The Explore tab shows posts from profiles that you do not follow.
            </Text>
          </View>
          <View style={s.listItemContainer}>
            <Text style={s.bulletedItem}>- Add Post Tab</Text>
            <Text style={s.bulletDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              The Add Post tab is where you can add a post.
            </Text>
          </View>
          <View style={s.listItemContainer}>
            <Text style={s.bulletedItem}>- Posts Tab</Text>
            <Text style={s.bulletDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              The Posts tab is where you can view your own posts.
            </Text>
          </View>
          <View style={s.listItemContainer}>
            <Text style={s.bulletedItem}>- Profile Tab</Text>
            <Text style={s.bulletDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              The Profile tab is where you can view and edit your profile information.
            </Text>
          </View>
        </View>
      </View>

      <View style={[s.section, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
        <View
          style={[s.subHeadingContainer, { borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
        >
          <Text lightColor={COLORS.sky[500]} darkColor={COLORS.sky[400]} style={s.subHeading}>
            Interacting With Content
          </Text>
        </View>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          There are several ways to interact with content.
        </Text>
        <View>
          <Text style={s.thirdHeading}>Liking Posts</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            You can like and unlike posts by pressing on the heart icon or by double tapping a post image.
          </Text>
        </View>
        <View>
          <Text style={s.thirdHeading}>Commenting</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            You can leave comments on posts by clicking on the comment button below each post.
          </Text>
        </View>
        <View>
          <Text style={s.thirdHeading}>Reply to Comments</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            You can reply directly to other comments to start a conversation.
          </Text>
        </View>
        <View>
          <Text style={s.thirdHeading}>Like Comments</Text>
          <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
            If you really enjoy a comment, you can like it by pressing the heart button next to the comment.
          </Text>
        </View>
      </View>

      <View style={[s.section, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
        <View
          style={[s.subHeadingContainer, { borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
        >
          <Text lightColor={COLORS.sky[500]} darkColor={COLORS.sky[400]} style={s.subHeading}>
            Saving Posts
          </Text>
        </View>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          If you find an amazing post (which you will) and want to save it for later, you can save posts by pressing on
          the save icon in the bottom right of each post.
        </Text>
        <Text style={s.paragraph} darkColor={COLORS.zinc[300]}>
          You can view your saved posts by going to the posts tab and pressing the menu button in the top right corner.
        </Text>
      </View>
    </ScrollView>
  );
};

export default AboutScreen;

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
    marginBottom: 12,
    fontWeight: "bold",
    marginTop: 8,
  },
  paragraph: {
    fontSize: 16,
    fontWeight: "300",
    marginBottom: 24,
  },
  listItemContainer: {
    marginBottom: 24,
  },
  bulletedItem: {
    fontSize: 18,
    marginBottom: 4,
  },
  bulletDescription: {
    fontSize: 16,
    fontWeight: "300",
    paddingLeft: 12,
  },
});
