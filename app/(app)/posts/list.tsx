import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";

import { getProfilePostsForQuery } from "@/api/profile";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { getNextPageParam } from "@/utils/utils";

const PostsListScreen = () => {
  const { authProfile } = useAuthProfileContext();
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

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

  const router = useRouter();

  const onProfilePress = (profileId: number) => {
    if (profileId === authProfile.id) {
      router.back();
      return;
    }
    router.push({ pathname: "/(app)/posts/profileDetails", params: { profileId: profileId.toString() } });
  };

  return <PostScrollList posts={dataToRender} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default PostsListScreen;
