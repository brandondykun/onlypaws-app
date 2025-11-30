import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { getPostForQuery } from "@/api/post";
import { PostDetailed } from "@/types";

type UsePostResult = UseQueryResult<PostDetailed, Error>;

/**
 * Custom hook for fetching an individual post by ID.
 * Automatically fetches when postId changes and provides a refetch function for error recovery.
 *
 * @param postId - The ID of the post to fetch
 *
 * @example
 * const { data: post, isError, isLoading, refetch  } = usePost(postId);
 *
 * if (isLoading) return <PostSkeleton />;
 * if (isError) return <ErrorMessage onRetry={refetch} />;
 * return <Post post={post} />;
 */
export function usePost(postId: number | string): UsePostResult {
  const fetchPost = async (id: number | string) => {
    const res = await getPostForQuery(id);
    return res.data;
  };

  const post = useQuery({
    queryKey: ["posts", "post", postId],
    queryFn: () => fetchPost(postId),
  });

  return post;
}
