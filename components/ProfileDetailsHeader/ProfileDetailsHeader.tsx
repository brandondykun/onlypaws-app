import { View, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Button from "../Button/Button";
import ProfileImage from "../ProfileImage/ProfileImage";
import Text from "../Text/Text";

type Props = {
  profileData: ProfileDetails;
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleUnfollowPress: (profileId: number) => void;
  profileLoading: boolean;
};
const ProfileDetailsHeader = ({
  profileData,
  postsCount,
  handleFollowersPress,
  handleFollowingPress,
  handleUnfollowPress,
  handleFollowPress,
  profileLoading,
}: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();

  const followButtons = (
    <>
      {profileData && profileData?.is_following ? (
        <Button
          text="unfollow"
          textStyle={{ fontSize: 12, color: isDarkMode ? COLORS.sky[500] : COLORS.sky[600] }}
          buttonStyle={{
            paddingHorizontal: 6,
            height: 30,
            width: "auto",
            borderColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[600],
            borderRadius: 4,
          }}
          variant="outline"
          onPress={() => handleUnfollowPress(profileData.id)}
        />
      ) : profileData ? (
        <Button
          text="follow"
          textStyle={{ fontSize: 12 }}
          buttonStyle={{
            paddingHorizontal: 6,
            height: 30,
            width: 60,
            backgroundColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[500],
            borderRadius: 4,
          }}
          onPress={() => handleFollowPress(profileData)}
        />
      ) : null}
    </>
  );

  return (
    <View style={{ padding: 16, backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ paddingTop: 12, gap: 12 }}>
          {!profileLoading ? (
            <>
              {/* <Text style={{ fontSize: 24 }}>{profileData?.username}</Text> */}
              <Text style={{ fontSize: 18 }}>{profileData?.name}</Text>
            </>
          ) : (
            <Text style={{ fontSize: 24, color: COLORS.zinc[500] }}>Loading...</Text>
          )}
          {profileData && profileData.id !== authProfile.id ? followButtons : null}
        </View>
        <ProfileImage image={(!profileLoading && profileData?.image) || null} size={100} />
      </View>
      <View style={{ paddingVertical: 24 }}>
        <Text style={{ fontSize: 16 }} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[600]}>
          {profileData?.about ? profileData.about : "No about text"}
        </Text>
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
