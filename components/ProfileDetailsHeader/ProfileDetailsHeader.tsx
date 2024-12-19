import { View, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Button from "../Button/Button";
import ProfileDetailsHeaderImage from "../ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "../Text/Text";

type Props = {
  profileData: ProfileDetails;
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleUnfollowPress: (profileId: number) => void;
  profileLoading: boolean;
  followLoading?: boolean;
};
const ProfileDetailsHeader = ({
  profileData,
  postsCount,
  handleFollowersPress,
  handleFollowingPress,
  handleUnfollowPress,
  handleFollowPress,
  profileLoading,
  followLoading,
}: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  // const navigation = useNavigation();

  const followButtons = (
    <>
      {profileData && profileData?.is_following && profileData?.id !== authProfile.id ? (
        <Button
          text="unfollow"
          textStyle={{ fontSize: 14, color: isDarkMode ? COLORS.sky[500] : COLORS.sky[600] }}
          buttonStyle={{
            paddingHorizontal: 0,
            height: 30,
            width: 75,
            borderColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[600],
            borderRadius: 4,
            marginRight: 4,
            marginTop: 2,
          }}
          variant="outline"
          onPress={() => handleUnfollowPress(profileData.id)}
          loading={followLoading}
          loadingIconSize={12}
          loadingIconScale={0.7}
        />
      ) : profileData && profileData?.id !== authProfile.id ? (
        <Button
          text="follow"
          textStyle={{ fontSize: 14 }}
          buttonStyle={{
            paddingHorizontal: 0,
            height: 30,
            width: 75,
            backgroundColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[500],
            borderRadius: 4,
            marginRight: 4,
            marginTop: 2,
          }}
          onPress={() => handleFollowPress(profileData)}
          loading={followLoading}
          loadingIconSize={12}
          loadingIconScale={0.7}
        />
      ) : null}
    </>
  );

  return (
    <View style={{ padding: 16, backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50] }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
        <View style={{ gap: 16, flex: 1 }}>
          {!profileLoading ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>{profileData?.name}</Text>
              <Text darkColor={COLORS.zinc[500]} style={{ fontSize: 16 }}>
                {profileData?.breed}
              </Text>
              <Text darkColor={COLORS.zinc[500]} style={{ fontSize: 16, marginBottom: 4 }}>
                {profileData?.pet_type?.name}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 24, color: COLORS.zinc[500] }}>Loading...</Text>
          )}
        </View>
        <ProfileDetailsHeaderImage image={(!profileLoading && profileData?.image) || null} />
      </View>
      <View style={{ paddingVertical: 24, gap: 24 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "300", marginBottom: 12 }}
          darkColor={COLORS.zinc[300]}
          lightColor={COLORS.zinc[900]}
        >
          {profileData?.about ? profileData.about : "No about text"}
        </Text>
        {profileData && profileData.id !== authProfile.id ? followButtons : null}
      </View>
      <View style={{ flexDirection: "row", paddingTop: 12 }}>
        <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 18 }}>{!profileLoading ? abbreviateNumber(postsCount) : "-"}</Text>
          <Text style={{ fontSize: 12, color: COLORS.zinc[600] }}>POSTS</Text>
        </View>
        <Pressable
          onPress={handleFollowersPress}
          style={({ pressed }) => [pressed && authProfile.id === profileData.id && { opacity: 0.6 }, { flex: 1 }]}
        >
          <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>
              {!profileLoading ? abbreviateNumber(profileData?.followers_count) : "-"}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.zinc[600] }}>FOLLOWERS</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={handleFollowingPress}
          style={({ pressed }) => [pressed && authProfile.id === profileData.id && { opacity: 0.6 }, { flex: 1 }]}
        >
          <View style={{ gap: 4, flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>
              {!profileLoading ? abbreviateNumber(profileData?.following_count) : "-"}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.zinc[600] }}>FOLLOWING</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileDetailsHeader;
