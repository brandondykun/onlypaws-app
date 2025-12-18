import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { ProfileDetails } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Text from "../../Text/Text";

type Props = {
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
  profileData: ProfileDetails;
};

const ProfileStats = ({ postsCount, handleFollowersPress, handleFollowingPress, profileData }: Props) => {
  const { authProfile } = useAuthProfileContext();

  return (
    <View style={s.root}>
      <View style={[s.profileNumberGroup, s.postsGroup]}>
        <Text style={s.profileNumber}>{abbreviateNumber(postsCount)}</Text>
        <Text style={s.profileNumberLabel} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
          POSTS
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={handleFollowersPress}
          style={({ pressed }) => [pressed && authProfile.id === profileData.id && { opacity: 0.6 }]}
          android_disableSound={profileData?.id !== authProfile.id ? true : false}
        >
          <View style={s.profileNumberGroup}>
            <Text style={s.profileNumber}>{abbreviateNumber(profileData?.followers_count)}</Text>
            <Text style={s.profileNumberLabel} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
              FOLLOWERS
            </Text>
          </View>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={handleFollowingPress}
          style={({ pressed }) => [pressed && authProfile.id === profileData.id && { opacity: 0.6 }]}
          android_disableSound={profileData?.id !== authProfile.id ? true : false}
        >
          <View style={s.profileNumberGroup}>
            <Text style={s.profileNumber}>{abbreviateNumber(profileData?.following_count)}</Text>
            <Text style={s.profileNumberLabel} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
              FOLLOWING
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileStats;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  profileNumberGroup: {
    gap: 4,
  },
  postsGroup: {
    flex: 1,
    justifyContent: "flex-start",
    marginRight: -12,
  },
  profileNumber: {
    fontSize: 18,
    fontWeight: "500",
  },
  profileNumberLabel: {
    fontSize: 11,
  },
});
