import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { RefreshControl } from "react-native";
import { View } from "react-native";

import { getTaggedPostsForQuery } from "@/api/post";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";
import { minutesToMilliseconds } from "@/utils/utils";

import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "../ListEmptyComponent/ListEmptyComponent";

type Props = {
  profileId: string;
  onPostPreviewPress: (index: number) => void;
};

const TaggedPosts = ({ profileId, onPostPreviewPress }: Props) => {
  const { authProfile, selectedProfileId } = useAuthProfileContext();

  const tabBarHeight = useBottomTabBarHeight();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getTaggedPostsForQuery(profileId, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: queryKeys.posts.tagged(selectedProfileId, profileId),
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: profileId === selectedProfileId ? 0 : minutesToMilliseconds(5),
  });

  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [posts.data]);

  const handleEndReached = () => {
    const hasErrors = posts.isError || posts.isFetchNextPageError;
    const isLoading = posts.isLoading || posts.isFetchingNextPage;

    if (posts.hasNextPage && !hasErrors && !isLoading) {
      posts.fetchNextPage();
    }
  };

  return (
    <FlashList
      showsVerticalScrollIndicator={false}
      data={posts.isLoading || posts.isRefetching ? [] : dataToRender}
      numColumns={3}
      contentContainerStyle={{ paddingBottom: tabBarHeight, flexGrow: 1 }}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
      onEndReached={handleEndReached}
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
      ListEmptyComponent={
        <ListEmptyComponent
          isLoading={posts.isLoading}
          isError={posts.isError}
          isRefetching={posts.isRefetching}
          errorMessage="There was an error fetching your tagged posts."
          errorSubMessage="Swipe down to try again."
          loadingComponent={<PostTileSkeleton />}
          emptyMessage={
            authProfile.public_id === profileId
              ? "You haven't been tagged in any posts yet!"
              : "This profile hasn't been tagged in any posts yet!"
          }
        />
      }
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
