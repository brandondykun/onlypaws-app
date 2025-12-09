import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Button from "../Button/Button";
import CollapsibleText from "../CollapsibleText/CollapsibleText";
import ProfileDetailsHeaderSkeleton from "../LoadingSkeletons/ProfileDetailsHeaderSkeleton";
import ProfileDetailsHeaderImage from "../ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "../Text/Text";

type Props = {
  profileData: ProfileDetails;
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleUnfollowPress: (profileId: number) => void;
  handleTaggedPostsPress: () => void;
  profileLoading: boolean;
  followLoading?: boolean;
  profileError: boolean;
};

const ProfileDetailsHeader = ({
  profileData,
  postsCount,
  handleFollowersPress,
  handleFollowingPress,
  handleUnfollowPress,
  handleFollowPress,
  handleTaggedPostsPress,
  profileLoading,
  followLoading,
  profileError,
}: Props) => {
  const { setLightOrDark } = useColorMode();
  const { authProfile } = useAuthProfileContext();

  const [aboutExpanded, setAboutExpanded] = useState(false);

  const router = useRouter();

  if (profileError) return <ProfileErrorMessage />;
  if (profileLoading) return <ProfileDetailsHeaderSkeleton showTwoButtons={authProfile.id === profileData?.id} />;

  const followButtons = (
    <>
      <View style={{ flex: 1 }}>
        {profileData && profileData?.is_following && profileData?.id !== authProfile.id ? (
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
            onPress={() => handleUnfollowPress(profileData.id)}
            loading={followLoading}
            loadingIconSize={12}
            loadingIconScale={0.7}
          />
        ) : profileData && profileData?.id !== authProfile.id ? (
          <Button
            text="Follow"
            textStyle={s.followButtonText}
            buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[500]) }]}
            onPress={() => handleFollowPress(profileData)}
            loading={followLoading}
            loadingIconSize={12}
            loadingIconScale={0.7}
          />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Button
          text="Tagged Posts"
          textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]) }]}
          buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
          onPress={handleTaggedPostsPress}
          icon={<FontAwesome name="tag" size={14} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[400])} />}
        />
      </View>
    </>
  );

  const selfProfileButtons = (
    <>
      <View style={{ flex: 1 }}>
        <Button
          text="Saved Posts"
          textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[50]) }]}
          buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
          onPress={() => router.push("/(app)/posts/savedPosts")}
          icon={<FontAwesome name="bookmark" size={14} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[400])} />}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Button
          text="Tagged Posts"
          textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[50]) }]}
          buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
          onPress={handleTaggedPostsPress}
          icon={<FontAwesome name="tag" size={14} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[400])} />}
        />
      </View>
    </>
  );

  return (
    <View style={s.profileInfoContainer}>
      <View style={{ flexDirection: "row", gap: 20, paddingBottom: 8 }}>
        <View>
          <ProfileDetailsHeaderImage size={100} image={profileData?.image || null} />
        </View>
        <View style={{ flex: 1, justifyContent: "space-around" }}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{profileData?.name}</Text>
          </View>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <View style={[s.profileNumberGroup, { flex: 1, justifyContent: "flex-start", marginRight: -12 }]}>
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
        </View>
      </View>

      {profileData?.about && (
        <View style={{ marginBottom: 24 }}>
          <CollapsibleText
            caption={profileData.about}
            numberOfLines={4}
            isExpanded={aboutExpanded}
            setIsExpanded={setAboutExpanded}
            textStyle={{ fontSize: 15, fontWeight: "400", lineHeight: 20 }}
          />
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
        {profileData.pet_type ? (
          <View
            style={{
              backgroundColor: setLightOrDark(COLORS.sky[100], `${COLORS.sky[950]}b3`),
              paddingVertical: 6,
              paddingHorizontal: 13,
              borderRadius: 100,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "500" }}>{profileData.pet_type.name}</Text>
          </View>
        ) : null}
        {profileData.breed ? (
          <View
            style={{
              backgroundColor: setLightOrDark(COLORS.sky[100], `${COLORS.sky[950]}b3`),
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 100,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "500" }}>{profileData.breed}</Text>
          </View>
        ) : null}
      </View>
      <View style={s.profileButtonsRoot}>
        {profileData && profileData.id !== authProfile.id ? followButtons : selfProfileButtons}
      </View>
    </View>
  );
};

export default ProfileDetailsHeader;

const ProfileErrorMessage = () => {
  const { isDarkMode } = useColorMode();

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        height: 280,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Ionicons name="alert-circle-outline" size={36} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
      <Text style={{ fontSize: 19, fontWeight: "400" }}>Error loading profile details</Text>
      <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={{ fontSize: 16, fontWeight: "300" }}>
        Swipe down to refresh
      </Text>
      <Entypo name="chevron-thin-down" size={20} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[500]} />
    </View>
  );
};

const s = StyleSheet.create({
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  profileNumbersSection: {
    flexDirection: "row",
    paddingBottom: 12,
  },
  profileNumberGroup: {
    gap: 4,
  },
  profileNumber: {
    fontSize: 18,
    fontWeight: "500",
  },
  profileNumberLabel: {
    fontSize: 11,
  },
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
    borderRadius: 8,
    marginTop: 2,
  },
  followButtonText: {
    fontSize: 16,
    color: COLORS.zinc[100],
    fontWeight: "600",
  },
  aboutText: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 24,
    lineHeight: 20,
  },
  petDetailsText: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 24,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});
