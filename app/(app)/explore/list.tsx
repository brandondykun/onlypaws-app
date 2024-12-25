import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { axiosInstance } from "@/api/config";
import { getSimilarPosts } from "@/api/post";
import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import Post from "@/components/Post/Post";
import { POST_HEIGHT } from "@/components/Post/Post";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useSavedPostsContext } from "@/context/SavedPostsContext";
import { PaginatedExploreResponse } from "@/types";
import { addCommentInState, likePostInState, unlikePostInState } from "@/utils/utils";

const ExplorePostsListScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { authProfile } = useAuthProfileContext();
  const { similarPosts, setSimilarPosts, likePost, unlikePost, addComment } = useExplorePostsContext();
  const savedPosts = useSavedPostsContext();
  const tabBarHeight = useBottomTabBarHeight();

  const router = useRouter();

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
    const { error, data } = await getSimilarPosts(Number(postId), authProfile.id);
    if (!error && data) {
      setSimilarPosts((prev) => [...prev, ...data.results]);
      setNextUrl(data.next);
      setInitialFetchLoading(false);
    }
  }, [authProfile.id, setSimilarPosts, postId]);

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

  const onLike = (postId: number) => {
    likePost(postId);
    likePostInState(savedPosts.setData, postId);
  };

  const onUnlike = (postId: number) => {
    unlikePost(postId);
    unlikePostInState(savedPosts.setData, postId);
  };

  const onComment = (postId: number) => {
    addComment(postId);
    addCommentInState(savedPosts.setData, postId);
  };

  return (
    <FlashList
      data={similarPosts}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      renderItem={({ item }) => (
        <Post
          post={item}
          onProfilePress={onProfilePress}
          setPosts={setSimilarPosts}
          onLike={onLike}
          onUnlike={onUnlike}
          onComment={onComment}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.4} // Trigger when 40% from the bottom
      onEndReached={!fetchNextLoading ? getNextPage : null}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={POST_HEIGHT}
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
