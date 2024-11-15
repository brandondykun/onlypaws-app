import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { axiosInstance } from "@/api/config";
import { getSimilarPosts } from "@/api/post";
import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import Post from "@/components/Post/Post";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { PaginatedExploreResponse } from "@/types";

const ExplorePostsListScreen = () => {
  const { postIndex } = useLocalSearchParams<{ postIndex: string }>();
  const { authProfile } = useAuthProfileContext();
  const { explorePosts, similarPosts, setSimilarPosts, likePost, unlikePost, addComment } = useExplorePostsContext();

  const router = useRouter();
  const selectedPost = explorePosts[Number(postIndex!)];

  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);

  const onProfilePress = useMemo(
    () => (profileId: number) => {
      router.push({ pathname: "/(app)/explore/profile", params: { profileId: profileId } });
    },
    [router],
  );

  const fetchSimilar = useCallback(async () => {
    const { error, data } = await getSimilarPosts(selectedPost.id, authProfile.id);
    if (!error && data) {
      setSimilarPosts((prev) => data.results);
      setNextUrl(data.next);
      setInitialFetchLoading(false);
    }
  }, [authProfile.id, selectedPost.id, setSimilarPosts]);

  useEffect(() => {
    fetchSimilar();

    return () => {
      setSimilarPosts([]);
    };
  }, [fetchSimilar, setSimilarPosts]);

  const getNextPage = useCallback(async () => {
    if (nextUrl) {
      setFetchNextLoading(true);
      const res = await axiosInstance.get<PaginatedExploreResponse>(nextUrl);
      if (res.data) {
        setSimilarPosts((prev) => [...prev, ...res.data.results]);
        setNextUrl(res.data.next);
      }
      setFetchNextLoading(false);
    }
  }, [setSimilarPosts, nextUrl]);

  return (
    <FlashList
      data={similarPosts}
      ListHeaderComponent={
        <Post
          post={selectedPost}
          onProfilePress={onProfilePress}
          setPosts={setSimilarPosts}
          onLike={likePost}
          onUnlike={unlikePost}
          onComment={addComment}
        />
      }
      renderItem={({ item }) => (
        <Post
          post={item}
          onProfilePress={onProfilePress}
          setPosts={setSimilarPosts}
          onLike={likePost}
          onUnlike={unlikePost}
          onComment={addComment}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.4} // Trigger when 40% from the bottom
      onEndReached={!fetchNextLoading ? getNextPage : null}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={600}
      ListFooterComponent={() => (
        <FlatListLoadingFooter
          nextUrl={nextUrl}
          fetchNextLoading={fetchNextLoading}
          initialFetchLoading={initialFetchLoading}
        />
      )}
    />
  );
};

export default ExplorePostsListScreen;
