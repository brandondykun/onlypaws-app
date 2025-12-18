import { View, StyleSheet } from "react-native";

import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "@/components/Text/Text";
import { ProfileDetails } from "@/types";

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
      <View style={s.nameAndStatsContainer}>
        <View style={s.nameContainer}>
          <Text style={s.nameText}>{profileData?.name}</Text>
        </View>
        <ProfileStats
          postsCount={postsCount}
          handleFollowersPress={handleFollowersPress}
          handleFollowingPress={handleFollowingPress}
          profileData={profileData}
        />
      </View>
    </View>
  );
};

export default ProfileImageAndStats;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 20,
    paddingBottom: 8,
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
    fontSize: 16,
    fontWeight: "600",
  },
});
