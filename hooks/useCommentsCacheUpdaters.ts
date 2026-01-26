import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { PostCommentDetailed } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";

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
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === commentId) {
                return { ...comment, liked: true, likes_count: comment.likes_count + 1 };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Unlike a top level comment
  const unlikeComment = useCallback(
    (commentId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === commentId) {
                return { ...comment, liked: false, likes_count: comment.likes_count - 1 };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Add a single reply to a comment so it displays nested under the top level comment
  // Used when a user manually adds a reply
  const addReply = useCallback(
    (parentCommentId: number, reply: PostCommentDetailed) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === parentCommentId) {
                return {
                  ...comment,
                  replies_count: comment.replies_count + 1,
                  replies: [...comment.replies, reply],
                };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Add multiple replies to a comment so they display nested under the top level comment
  // Used when a user fetches multiple replies for a top level comment
  const addReplies = useCallback(
    (parentCommentId: number, replies: PostCommentDetailed[]) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === parentCommentId) {
                // Filter added replies to remove duplicates
                // This can happen if a user adds a comment and then fetches more comments.
                // It will eventually return the newly added comment that was added
                // on the front end without an API call
                const currentReplies = comment.replies.map((reply) => reply.id);
                const newFilteredReplies = replies.filter((reply) => !currentReplies.includes(reply.id));
                return { ...comment, replies: [...comment.replies, ...newFilteredReplies] };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Clear replies array for a comment to visually hide the replies
  const hideReplies = useCallback(
    (parentCommentId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === parentCommentId) {
                return { ...comment, replies: [] };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Like a nested reply comment
  const likeReply = useCallback(
    (commentId: number, replyId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === replyId) {
                      return { ...reply, liked: true, likes_count: reply.likes_count + 1 };
                    }
                    return reply;
                  }),
                };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Unlike a nested reply comment
  const unlikeReply = useCallback(
    (commentId: number, replyId: number) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === replyId) {
                      return { ...reply, liked: false, likes_count: reply.likes_count - 1 };
                    }
                    return reply;
                  }),
                };
              }
              return comment;
            }),
          })),
        };
      });
    },
    [queryClient, commentsQueryKey],
  );

  // Prepend a new top-level comment to the first page
  const prependComment = useCallback(
    (comment: PostCommentDetailed) => {
      queryClient.setQueryData<CommentsInfiniteData>(commentsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, results: [comment, ...page.results] };
            }
            return page;
          }),
        };
      });
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
