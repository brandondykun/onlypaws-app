import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";

import Button from "@/components/Button/Button";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails } from "@/types";

import FollowButton from "./FollowButton";

type Props = {
  profileData: ProfileDetails;
  authProfile: ProfileDetails;
  followLoading: boolean;
  handleUnfollowPress: (profileId: number) => void;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleTaggedPostsPress: () => void;
};
const ActionButtons = ({
  profileData,
  authProfile,
  followLoading,
  handleUnfollowPress,
  handleFollowPress,
  handleTaggedPostsPress,
}: Props) => {
  const { setLightOrDark } = useColorMode();
  const router = useRouter();

  return (
    <View style={s.profileButtonsRoot}>
      <View style={{ flex: 1 }}>
        {profileData?.id !== authProfile.id ? (
          <FollowButton
            profileData={profileData}
            followLoading={!!followLoading}
            handleUnfollowPress={handleUnfollowPress}
            handleFollowPress={handleFollowPress}
          />
        ) : (
          <Button
            text="Saved Posts"
            textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[50]) }]}
            buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[700]) }]}
            onPress={() => router.push("/(app)/posts/savedPosts")}
            icon={<FontAwesome name="bookmark" size={14} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[400])} />}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Button
          text="Tagged Posts"
          textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]) }]}
          buttonStyle={[
            s.headerButton,
            {
              backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[700]),
              opacity: !profileData.can_view_posts ? 0.6 : 1,
            },
          ]}
          onPress={handleTaggedPostsPress}
          icon={<FontAwesome name="tag" size={14} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[400])} />}
          disabled={!profileData.can_view_posts}
        />
      </View>
    </View>
  );
};

export default ActionButtons;

const s = StyleSheet.create({
  profileButtonsRoot: {
    flexDirection: "row",
    paddingBottom: 12,
    gap: 12,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerButton: {
    paddingHorizontal: 0,
    height: 34,
    borderRadius: 6,
    marginTop: 2,
  },
});
