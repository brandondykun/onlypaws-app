import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { PostCommentDetailed } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";
import { updateInfiniteItemById, upsertInfiniteItem } from "@/utils/query/cacheUtils";

// Type alias for infinite query data structure
type CommentsInfiniteData = InfiniteData<PaginatedResponse<PostCommentDetailed>>;

/**
 * Hook that provides cache update functions for comments.
 * Encapsulates all the React Query cache manipulation logic for the comments list.
 */
const useCommentsCacheUpdaters = (commentsQueryKey: readonly unknown[]) => {
  const queryClient = useQueryClient();

  // Like a top level comment
  const likeComment = useCallback(
    (commentId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, commentId, (comment) => ({
          ...comment,
          liked: true,
          likes_count: comment.likes_count + 1,
        }));
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Unlike a top level comment
  const unlikeComment = useCallback(
    (commentId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, commentId, (comment) => ({
          ...comment,
          liked: false,
          likes_count: comment.likes_count - 1,
        }));
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Add a single reply to a comment so it displays nested under the top level comment
  // Used when a user manually adds a reply
  const addReply = useCallback(
    (parentCommentId: number, reply: PostCommentDetailed) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, parentCommentId, (comment) => ({
          ...comment,
          replies_count: comment.replies_count + 1,
          replies: [...comment.replies, reply],
        }));
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Add multiple replies to a comment so they display nested under the top level comment
  // Used when a user fetches multiple replies for a top level comment
  const addReplies = useCallback(
    (parentCommentId: number, replies: PostCommentDetailed[]) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, parentCommentId, (comment) => {
          // Filter added replies to remove duplicates
          // This can happen if a user adds a comment and then fetches more comments.
          // It will eventually return the newly added comment that was added
          // on the front end without an API call
          const currentReplies = comment.replies.map((reply) => reply.id);
          const newFilteredReplies = replies.filter((reply) => !currentReplies.includes(reply.id));
          return {
            ...comment,
            replies: [...comment.replies, ...newFilteredReplies],
          };
        });
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Clear replies array for a comment to visually hide the replies
  const hideReplies = useCallback(
    (parentCommentId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, parentCommentId, (comment) => ({ ...comment, replies: [] }));
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Like a nested reply comment
  const likeReply = useCallback(
    (commentId: number, replyId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, commentId, (comment) => ({
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id === replyId) {
              return { ...reply, liked: true, likes_count: reply.likes_count + 1 };
            }
            return reply;
          }),
        }));
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Unlike a nested reply comment
  const unlikeReply = useCallback(
    (commentId: number, replyId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        return updateInfiniteItemById(oldData, commentId, (comment) => ({
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id === replyId) {
              return { ...reply, liked: false, likes_count: reply.likes_count - 1 };
            }
            return reply;
          }),
        }));
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Add a new top-level comment (prepends to first page, or updates if already exists)
  const prependComment = useCallback(
    (comment: PostCommentDetailed) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) =>
        upsertInfiniteItem(oldData, comment),
      );
    },
    [queryClient, commentsQueryKey],
  );

  return {
    likeComment,
    unlikeComment,
    addReply,
    addReplies,
    hideReplies,
    likeReply,
    unlikeReply,
    prependComment,
  };
};

export default useCommentsCacheUpdaters;
