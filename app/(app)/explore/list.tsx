import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { axiosInstance } from "@/api/config";
import { getSimilarPosts } from "@/api/post";
import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import Post from "@/components/Post/Post";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useExploreProfileDetailsContext } from "@/context/ExploreProfileDetailsContext";
import { useAdsInList } from "@/hooks/useAdsInList";
import { PaginatedExploreResponse, PostDetailed } from "@/types";

const ExplorePostsListScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { similarPosts, setSimilarPosts } = useExplorePostsContext();
  const tabBarHeight = useBottomTabBarHeight();
  const exploreProfile = useExploreProfileDetailsContext();

  const router = useRouter();

  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const onProfilePress = useMemo(
    () => (profileId: number) => {
      exploreProfile.setProfileId(profileId);
      router.push({ pathname: "/(app)/explore/profile", params: { profileId: profileId } });
    },
    [router, exploreProfile],
  );

  const fetchSimilar = useCallback(async () => {
    setHasInitialFetchError(false);
    setHasFetchNextError(false);
    const { error, data } = await getSimilarPosts(Number(postId));

    if (!error && data) {
      setSimilarPosts((prev) => [...prev, ...data.results]);
      setFetchNextUrl(data.next);
    } else {
      setHasInitialFetchError(true);
    }
    setInitialFetchComplete(true);
  }, [setSimilarPosts, postId]);

  useEffect(() => {
    fetchSimilar();

    return () => {
      setSimilarPosts([]);
    };
  }, [fetchSimilar, setSimilarPosts]);

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);

      try {
        const response = await axiosInstance.get<PaginatedExploreResponse>(fetchNextUrl);
        const nextData = response.data;

        if (nextData && nextData.results) {
          setSimilarPosts((prev) => [...prev, ...nextData.results]);
          setFetchNextUrl(nextData.next);
        } else {
          setHasFetchNextError(true);
        }
      } catch {
        setHasFetchNextError(true);
      } finally {
        setFetchNextLoading(false);
      }
    }
  }, [setSimilarPosts, fetchNextUrl]);

  // Render function for posts
  const renderPost = useCallback(
    (post: PostDetailed) => <Post post={post} onProfilePress={onProfilePress} />,
    [onProfilePress],
  );

  // Use the ads hook - handles everything automatically!
  const { data, renderItem, keyExtractor } = useAdsInList({
    items: similarPosts,
    renderItem: renderPost,
  });

  return (
    <FlashList
      data={data}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4} // Trigger when 40% from the bottom
      onEndReached={!fetchNextLoading ? fetchNext : null}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        hasInitialFetchError ? (
          <RetryFetchFooter
            fetchFn={fetchSimilar}
            message="Oh no! There was an error fetching posts!"
            buttonText="Retry"
          />
        ) : hasFetchNextError ? (
          <RetryFetchFooter
            fetchFn={fetchNext}
            message="Oh no! There was an error fetching more posts!"
            buttonText="Retry"
          />
        ) : (
          <FlatListLoadingFooter
            nextUrl={fetchNextUrl}
            fetchNextLoading={fetchNextLoading}
            initialFetchLoading={!initialFetchComplete}
          />
        )
      }
    />
  );
};

export default ExplorePostsListScreen;
