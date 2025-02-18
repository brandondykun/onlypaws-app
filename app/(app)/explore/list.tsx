import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { axiosInstance } from "@/api/config";
import { getSimilarPosts } from "@/api/post";
import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import Post from "@/components/Post/Post";
import { POST_HEIGHT } from "@/components/Post/Post";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useExploreProfileDetailsContext } from "@/context/ExploreProfileDetailsContext";
import { PaginatedExploreResponse } from "@/types";

const ExplorePostsListScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { authProfile } = useAuthProfileContext();
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
    const { error, data } = await getSimilarPosts(Number(postId), authProfile.id);

    if (!error && data) {
      setSimilarPosts((prev) => [...prev, ...data.results]);
      setFetchNextUrl(data.next);
    } else {
      setHasInitialFetchError(true);
    }
    setInitialFetchComplete(true);
  }, [authProfile.id, setSimilarPosts, postId]);

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

  return (
    <FlashList
      data={similarPosts}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      renderItem={({ item }) => <Post post={item} onProfilePress={onProfilePress} />}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.4} // Trigger when 40% from the bottom
      onEndReached={!fetchNextLoading ? fetchNext : null}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={POST_HEIGHT}
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
