import React from "react";
import { StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails } from "@/types";

import Button from "../../Button/Button";

type Props = {
  profileData: ProfileDetails;
  followLoading: boolean;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleUnfollowPress: (profileId: string) => void;
};

const FollowButton = ({ profileData, followLoading, handleUnfollowPress, handleFollowPress }: Props) => {
  const { setLightOrDark } = useColorMode();

  const isFollowPending = profileData.has_requested_follow && !profileData.is_following;

  if (isFollowPending && !profileData.is_following) {
    return (
      <Button
        text="Follow Requested"
        textStyle={s.followButtonText}
        variant="outline"
        buttonStyle={{
          ...s.headerButton,
          borderColor: setLightOrDark(COLORS.sky[600], COLORS.sky[900]),
          backgroundColor: `${COLORS.sky[500]}1A`,
        }}
        disabled
      />
    );
  }
  return (
    <>
      {profileData?.is_following ? (
        <Button
          text="Unfollow"
          textStyle={[s.followButtonText, { color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }]}
          buttonStyle={[
            s.headerButton,
            {
              borderColor: setLightOrDark(COLORS.sky[600], COLORS.sky[700]),
              backgroundColor: `${COLORS.sky[500]}1A`,
            },
          ]}
          variant="outline"
          onPress={() => handleUnfollowPress(profileData.public_id)}
          loading={followLoading}
          loadingIconSize={12}
          loadingIconScale={0.7}
        />
      ) : (
        <Button
          text={profileData.follows_you ? "Follow Back" : "Follow"}
          textStyle={s.followButtonText}
          buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[700]) }]}
          onPress={() => handleFollowPress(profileData)}
          loading={followLoading}
          loadingIconSize={12}
          loadingIconScale={0.7}
        />
      )}
    </>
  );
};

export default FollowButton;

const s = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 0,
    height: 34,
    borderRadius: 6,
    marginTop: 2,
  },
  followButtonText: {
    fontSize: 16,
    color: COLORS.zinc[100],
    fontWeight: "600",
  },
});
