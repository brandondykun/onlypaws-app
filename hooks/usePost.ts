import { useState, useEffect, useCallback } from "react";

import { getPost } from "@/api/post";
import { PostDetailed } from "@/types";

interface UsePostResult {
  post: PostDetailed | null;
  setPost: React.Dispatch<React.SetStateAction<PostDetailed | null>>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching an individual post by ID.
 * Automatically fetches when postId changes and provides a refetch function for error recovery.
 *
 * @param postId - The ID of the post to fetch
 *
 * @example
 * const { post, loading, error, refetch } = usePost(postId);
 *
 * if (loading) return <PostSkeleton />;
 * if (error) return <ErrorMessage onRetry={refetch} />;
 * return <Post post={post} />;
 */
export function usePost(postId: number | string | undefined): UsePostResult {
  const [post, setPost] = useState<PostDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setError("No post ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getPost(postId);

    if (data && !fetchError) {
      setPost(data);
      setError(null);
    } else {
      setError("Error fetching post");
      setPost(null);
    }

    setLoading(false);
  }, [postId]);

  // Initial fetch and refetch when postId changes
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Refetch function for manual retries
  const refetch = useCallback(async () => {
    await fetchPost();
  }, [fetchPost]);

  return {
    post,
    setPost,
    loading,
    error,
    refetch,
  };
}
