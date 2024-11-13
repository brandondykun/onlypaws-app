import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { SearchedProfile } from "@/types";

import Button from "../Button/Button";
import Text from "../Text/Text";

type Props = {
  profile: SearchedProfile;
  handleFollowPress: (searchedProfile: SearchedProfile) => Promise<void>;
  handleUnfollowPress: (profileId: number) => Promise<void>;
};

const ICON_SIZE = 42;

const SearchedProfilePreview = ({ profile, handleFollowPress, handleUnfollowPress }: Props) => {
  const router = useRouter();
  const { isDarkMode } = useColorMode();

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
        style={({ pressed }) => [pressed && { opacity: 0.6 }, { flex: 1 }]}
        onPress={() => {
          router.push({ pathname: "/(app)/explore/profile", params: { profileId: profile.id } });
        }}
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
            <Text style={{ fontWeight: "700", fontSize: 14 }}>{profile.username}</Text>
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
      <View>
        {profile.is_following ? (
          <Button
            text="unfollow"
            textStyle={{ fontSize: 12 }}
            buttonStyle={{ paddingHorizontal: 4, height: 28, width: 60, borderRadius: 6 }}
            variant="outline"
            onPress={() => handleUnfollowPress(profile.id)}
            testID={`${profile.username}-unfollow`}
          />
        ) : (
          <Button
            text="follow"
            textStyle={{ fontSize: 12 }}
            buttonStyle={{ paddingHorizontal: 4, height: 28, width: 60, borderRadius: 6 }}
            onPress={() => handleFollowPress(profile)}
            testID={`${profile.username}-follow`}
          />
        )}
      </View>
    </View>
  );
};

export default SearchedProfilePreview;
