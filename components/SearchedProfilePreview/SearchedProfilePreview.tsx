import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { View, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { SearchedProfile } from "@/types";

import Button from "../Button/Button";
import Text from "../Text/Text";

type Props =
  | {
      profile: SearchedProfile;
      handleFollowPress: (searchedProfile: SearchedProfile) => void;
      handleUnfollowPress: (profileId: number) => void;
      onPress?: ((profileId: number, username?: string) => void) | undefined;
      showFollowButtons?: true;
      handleCancelFollowRequest: (profileId: number) => void;
    }
  | {
      profile: SearchedProfile;
      handleFollowPress?: undefined;
      handleUnfollowPress?: undefined;
      onPress?: ((profileId: number, username?: string) => void) | undefined;
      showFollowButtons?: false;
      handleCancelFollowRequest?: undefined;
    };

const ICON_SIZE = 42;

const SearchedProfilePreview = ({
  profile,
  handleFollowPress,
  handleUnfollowPress,
  onPress,
  handleCancelFollowRequest,
  showFollowButtons = true,
}: Props) => {
  const { authProfile } = useAuthProfileContext();
  const { isDarkMode } = useColorMode();

  const handlePress = () => {
    if (onPress && !isOwnProfile) {
      onPress(profile.id, profile.username);
    }
  };

  const isOwnProfile = authProfile.id === profile.id;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 24,
      }}
    >
      <Pressable
        style={({ pressed }) => [pressed && onPress && !isOwnProfile && { opacity: 0.6 }, { flex: 1 }]}
        onPress={handlePress}
      >
        <View style={{ flexDirection: "row", gap: 8, flex: 1 }}>
          <View>
            {profile.image ? (
              <Image
                source={{ uri: profile.image.image }}
                style={{ borderRadius: ICON_SIZE, height: ICON_SIZE, width: ICON_SIZE }}
              />
            ) : (
              <View
                style={{
                  height: ICON_SIZE,
                  width: ICON_SIZE,
                  borderRadius: ICON_SIZE,
                  backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[400],
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="paw" size={ICON_SIZE - 20} color={isDarkMode ? COLORS.zinc[600] : COLORS.zinc[300]} />
              </View>
            )}
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontWeight: "700", fontSize: 14, marginBottom: 2 }} numberOfLines={1}>
              {isOwnProfile ? "You" : profile.username}
            </Text>
            <Text
              style={{
                color: COLORS.zinc[500],
                fontStyle: profile.about ? "normal" : "italic",
                fontSize: 13,
              }}
              numberOfLines={1}
            >
              {profile.about ? profile.about : "No about text"}
            </Text>
          </View>
        </View>
      </Pressable>
      {showFollowButtons && profile.has_requested_follow && (
        <Button
          text="Cancel"
          textStyle={{ fontSize: 13 }}
          buttonStyle={{ height: 30, width: 70 }}
          variant="outline"
          onPress={() => handleCancelFollowRequest?.(profile.id)}
          testID={`${profile.username}-cancel-request`}
        />
      )}
      {!profile.has_requested_follow && showFollowButtons && !isOwnProfile && (
        <View>
          {profile.is_following ? (
            <Button
              text="Unfollow"
              textStyle={{ fontSize: 13 }}
              buttonStyle={{ height: 30, width: 70 }}
              variant="outline"
              onPress={() => handleUnfollowPress?.(profile.id)}
              testID={`${profile.username}-unfollow`}
            />
          ) : (
            <Button
              text="Follow"
              textStyle={{ fontSize: 13 }}
              buttonStyle={{ height: 30, width: 70 }}
              onPress={() => handleFollowPress?.(profile)}
              testID={`${profile.username}-follow`}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default SearchedProfilePreview;
