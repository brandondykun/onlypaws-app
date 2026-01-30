import { View, StyleSheet } from "react-native";

import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { ProfileDetails } from "@/types";

import FollowIndicator from "./FollowIndicator";
import ProfileStats from "./ProfileStats";

type Props = {
  profileData: ProfileDetails;
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
};

const ProfileImageAndStats = ({ profileData, postsCount, handleFollowersPress, handleFollowingPress }: Props) => {
  return (
    <View style={s.root}>
      <ProfileDetailsHeaderImage size={100} image={profileData?.image || null} />
      <View style={{ ...s.nameAndStatsContainer, gap: profileData.follows_you ? 8 : 0 }}>
        <View style={s.nameContainer}>
          <Text style={s.nameText} lightColor={COLORS.zinc[950]}>
            {profileData?.name}
          </Text>
        </View>
        <ProfileStats
          postsCount={postsCount}
          handleFollowersPress={handleFollowersPress}
          handleFollowingPress={handleFollowingPress}
          profileData={profileData}
        />
        {profileData.follows_you && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FollowIndicator followsYou={profileData.follows_you} isFollowing={profileData.is_following} />
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfileImageAndStats;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  nameAndStatsContainer: {
    flex: 1,
    justifyContent: "space-around",
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
