import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { View } from "react-native";

import { getTaggedPostsForQuery } from "@/api/post";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { getNextPageParam } from "@/utils/utils";
import { minutesToMilliseconds } from "@/utils/utils";

import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";

type Props = {
  profileId: string;
  onPostPreviewPress: (index: number) => void;
};

const TaggedPosts = ({ profileId, onPostPreviewPress }: Props) => {
  const { authProfile } = useAuthProfileContext();
  const { selectedProfileId } = useAuthUserContext();
  const { isDarkMode } = useColorMode();

  const tabBarHeight = useBottomTabBarHeight();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getTaggedPostsForQuery(profileId, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "tagged", profileId.toString()],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: profileId === authProfile.id.toString() ? 0 : minutesToMilliseconds(5),
    enabled: !!selectedProfileId,
  });

  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  const emptyComponent =
    posts.isLoading || (posts.isError && posts.isRefetching) ? (
      <PostTileSkeleton />
    ) : !posts.isError ? (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            paddingHorizontal: 36,
            fontWeight: "300",
            paddingTop: 96,
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          {authProfile.id.toString() === profileId
            ? "You haven't been tagged in any posts yet!"
            : "This profile hasn't been tagged in any posts yet!"}
        </Text>
      </View>
    ) : (
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
        <Text style={{ fontSize: 19, fontWeight: "400" }}>Error loading posts</Text>
        <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={{ fontSize: 16, fontWeight: "300" }}>
          Swipe down to refresh
        </Text>
        <Entypo name="chevron-thin-down" size={20} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[500]} />
      </View>
    );

  return (
    <FlashList
      showsVerticalScrollIndicator={false}
      data={posts.isLoading || posts.isRefetching ? [] : dataToRender}
      numColumns={3}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
      onEndReached={
        !posts.isFetchingNextPage && !posts.isLoading && !posts.isError && !posts.isFetchNextPageError
          ? () => posts.fetchNextPage()
          : null
      }
      ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
      refreshing={posts.isRefetching}
      refreshControl={
        <RefreshControl
          refreshing={posts.isRefetching}
          onRefresh={posts.refetch}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
        />
      }
      ListEmptyComponent={emptyComponent}
      renderItem={({ item, index }) => {
        return <PostTile post={item} index={index} onPress={() => onPostPreviewPress(index)} />;
      }}
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={posts.isFetchingNextPage}
          isError={posts.isFetchNextPageError}
          fetchNextPage={posts.fetchNextPage}
          message="Oh no! There was an error fetching more posts!"
        />
      }
    />
  );
};

export default TaggedPosts;
