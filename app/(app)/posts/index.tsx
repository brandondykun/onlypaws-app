import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Pressable, View, StyleSheet } from "react-native";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useNotificationsContext } from "@/context/NotificationsContext";

const PostsScreen = () => {
  const { authProfile, selectedProfileId } = useAuthProfileContext();
  const router = useRouter();
  const navigation = useNavigation();
  const { setLightOrDark } = useColorMode();
  const { unreadCount } = useNotificationsContext();
  const { skipRefetch } = useLocalSearchParams<{ skipRefetch?: string }>();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/posts/list", params: { initialIndex: index } });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        // only show if user is looking at own profile
        return (
          <Pressable
            onPress={() => router.push("/(app)/posts/notifications")}
            style={({ pressed }) => [pressed && { opacity: 0.7 }, { padding: 8, flexDirection: "row", gap: 2 }]}
            hitSlop={20}
            testID="notifications-menu-button"
          >
            <Ionicons name="notifications" size={22} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
            {unreadCount > 0 ? (
              <View
                style={[s.notificationsCountIcon, { backgroundColor: COLORS.red[500] }]}
                testID={`notifications-count-icon-${unreadCount}`}
              >
                <Text style={{ fontSize: 12, fontWeight: "600" }} lightColor={COLORS.zinc[50]}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      },
    });
  }, [navigation, authProfile.id, unreadCount, router, setLightOrDark]);

  const handleTaggedPostsPress = () => {
    router.push({ pathname: "/(app)/posts/taggedPosts", params: { profileId: selectedProfileId } });
  };

  return (
    <ProfileDetails
      profileId={selectedProfileId}
      onPostPreviewPress={handlePostPreviewPress}
      onTaggedPostsPress={handleTaggedPostsPress}
      skipInitialRefetch={skipRefetch === "true"}
    />
  );
};

export default PostsScreen;

const s = StyleSheet.create({
  notificationsCountIcon: {
    backgroundColor: COLORS.red[500],
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 100,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
