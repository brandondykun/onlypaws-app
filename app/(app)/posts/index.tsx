import Ionicons from "@expo/vector-icons/Ionicons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { Pressable, View, StyleSheet } from "react-native";

import { getProfilePostsForQuery } from "@/api/profile";
import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { getNextPageParam } from "@/utils/utils";

const PostsScreen = () => {
  const { authProfile, refetch, refreshing, loading } = useAuthProfileContext();
  const router = useRouter();
  const navigation = useNavigation();
  const { setLightOrDark } = useColorMode();
  const { unreadCount } = useNotificationsContext();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(authProfile.id, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: ["posts", "authProfile", authProfile.id],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
  });

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

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
            style={({ pressed }) => [
              pressed && { opacity: 0.7 },
              { paddingLeft: 0, paddingVertical: 8, flexDirection: "row", gap: 2 },
            ]}
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

  return (
    <ProfileDetails
      profileId={authProfile.id}
      onPostPreviewPress={handlePostPreviewPress}
      profileData={authProfile}
      profileLoading={refreshing || loading}
      profileRefresh={() => refetch()}
      profileRefreshing={refreshing}
      profileError={false} // this will be false for the users own profile, the data is already fetched in the AuthProfileContext
      postsLoading={posts.isLoading}
      postsError={posts.isError}
      postsData={dataToRender}
      postsRefresh={() => posts.refetch()}
      postsRefreshing={posts.isRefetching}
      fetchNext={() => posts.fetchNextPage()}
      fetchNextLoading={posts.isFetchingNextPage}
      hasFetchNextError={posts.isFetchNextPageError}
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
