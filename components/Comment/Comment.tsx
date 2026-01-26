import { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { deleteCommentLike, getCommentRepliesForQuery, likeComment as likeCommentApi } from "@/api/interactions";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import useCommentsCacheUpdaters from "@/hooks/useCommentsCacheUpdaters";
import { PostCommentDetailed } from "@/types";
import { getNextPageParam } from "@/utils/utils";

import FetchRepliesRetry from "./FetchRepliesRetry";
import HideRepliesButton from "./HideRepliesButton";
import MainComment from "./MainComment";
import MainCommentReplyButton from "./MainCommentReplyButton";
import ReplyComment from "./ReplyComment";
import ReplyCommentReplyButton from "./ReplyCommentReplyButton";
import ShowRepliesButton from "./ShowRepliesButton";

type Props = {
  comment: PostCommentDetailed;
  onReplyPress: (parentComment: PostCommentDetailed, replyingToComment: PostCommentDetailed) => void;
  commentIndex: number;
  listRef: React.RefObject<BottomSheetFlatListMethods>;
  replyToCommentId?: number;
  commentsQueryKey: readonly unknown[];
};

const Comment = ({ comment, onReplyPress, listRef, commentIndex, replyToCommentId, commentsQueryKey }: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const queryClient = useQueryClient();

  // State to track if user has requested to show replies
  const [showReplies, setShowReplies] = useState(false);

  // Query key for this comment's replies
  const repliesQueryKey = useMemo(() => ["comment-replies", comment.id] as const, [comment.id]);

  // Cache updaters for the comments
  const { likeComment, unlikeComment, addReplies, hideReplies, likeReply, unlikeReply } =
    useCommentsCacheUpdaters(commentsQueryKey);

  // Query for fetching replies using useInfiniteQuery
  const repliesQuery = useInfiniteQuery({
    queryKey: repliesQueryKey,
    queryFn: async ({ pageParam }) => {
      const response = await getCommentRepliesForQuery(comment.id, pageParam);
      return response.data;
    },
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: showReplies && comment.replies_count > comment.replies.length,
  });

  // Sync fetched replies to main comments cache when data changes
  useEffect(() => {
    if (repliesQuery.data) {
      const allReplies = repliesQuery.data.pages.flatMap((page) => page.results);
      if (allReplies.length > 0) {
        addReplies(comment.id, allReplies);
      }
    }
  }, [repliesQuery.data, comment.id, addReplies]);

  // Handle liking a top level comment
  const handleLike = async (commentId: number) => {
    Haptics.impactAsync();
    likeComment(commentId); // optimistic like
    const { error } = await likeCommentApi(commentId, authProfile.id);
    if (error) {
      unlikeComment(commentId); // revert like on error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error liking that comment.",
      });
    }
  };

  // Handle un-liking a top level comment
  const handleUnlike = async (commentId: number) => {
    Haptics.selectionAsync();
    unlikeComment(commentId); // optimistic unlike
    const { error } = await deleteCommentLike(commentId);
    if (error) {
      likeComment(commentId); // revert unlike on error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error removing that like.",
      });
    }
  };

  // Wrapper function to call either like or unlike comment
  const handleHeartPress = (commentId: number) => {
    if (comment.liked) {
      handleUnlike(commentId);
    } else {
      handleLike(commentId);
    }
  };

  // Show replies by enabling the query
  const fetchReplies = useCallback(() => {
    setShowReplies(true);
  }, []);

  // Fetch next page of replies
  const fetchNext = useCallback(() => {
    if (repliesQuery.hasNextPage && !repliesQuery.isFetchingNextPage) {
      repliesQuery.fetchNextPage();
    }
  }, [repliesQuery]);

  // Retry fetching replies after an error
  const retryFetchReplies = useCallback(() => {
    if (repliesQuery.isFetchNextPageError) {
      repliesQuery.fetchNextPage();
    } else if (repliesQuery.isError) {
      repliesQuery.refetch();
    }
  }, [repliesQuery]);

  // Hide replies and reset state
  const handleHideReplies = useCallback(() => {
    hideReplies(comment.id);
    setShowReplies(false);
    // Clear the replies query cache so it refetches when shown again
    queryClient.removeQueries({ queryKey: repliesQueryKey });
  }, [hideReplies, comment.id, queryClient, repliesQueryKey]);

  // Handle liking a nested reply comment
  const handleLikeReply = async (id: number) => {
    Haptics.impactAsync();
    likeReply(comment.id, id);
    const { error } = await likeCommentApi(id, authProfile.id);
    if (error) {
      unlikeReply(comment.id, id);
    }
  };

  // Handle un-liking a nested reply comment
  const handleUnlikeReply = async (id: number) => {
    Haptics.selectionAsync();
    unlikeReply(comment.id, id);
    const { error } = await deleteCommentLike(id);
    if (error) {
      likeReply(comment.id, id);
    }
  };

  const bgColor = getCommentBgColor(replyToCommentId, comment.id, isDarkMode);

  // Determine loading and error states from useInfiniteQuery
  const isLoadingReplies = repliesQuery.isLoading || repliesQuery.isFetchingNextPage;
  const hasError = repliesQuery.isError || repliesQuery.isFetchNextPageError;
  const hasMoreReplies = comment.replies_count !== comment.replies.length;

  return (
    <View style={[s.root]}>
      <MainComment comment={comment} handleHeartPress={handleHeartPress} bgColor={bgColor} />
      <MainCommentReplyButton
        onReplyPress={() => {
          onReplyPress(comment, comment);
          setTimeout(() => {
            // needs timeout to allow the keyboard to open before scrolling
            listRef.current?.scrollToIndex({ index: commentIndex, animated: true });
          }, 250);
        }}
      />
      {comment.replies_count > 0 ? (
        <>
          <View style={{ padding: 0 }}>
            {comment.replies?.map((replyComment, index) => {
              const bgColor = getCommentBgColor(replyToCommentId, replyComment.id, isDarkMode);

              return (
                <View style={{ marginVertical: 6 }} key={index}>
                  <ReplyComment
                    replyComment={replyComment}
                    handleLikeReply={handleLikeReply}
                    handleUnlikeReply={handleUnlikeReply}
                    bgColor={bgColor}
                  />
                  <ReplyCommentReplyButton
                    onReplyPress={() => {
                      onReplyPress(comment, replyComment);
                    }}
                  />
                </View>
              );
            })}
          </View>
          <View style={{ marginTop: 6, paddingLeft: 16, marginBottom: 12 }}>
            {hasError ? (
              <FetchRepliesRetry onPress={retryFetchReplies} />
            ) : isLoadingReplies ? (
              <ActivityIndicator
                color={COLORS.zinc[500]}
                style={{ alignItems: "flex-start", paddingLeft: 56, height: 14, width: 14 }}
              />
            ) : hasMoreReplies ? (
              <ShowRepliesButton
                onPress={showReplies ? fetchNext : fetchReplies}
                commentRepliesCount={comment.replies_count}
                commentRepliesLength={comment.replies.length}
              />
            ) : (
              <HideRepliesButton onPress={handleHideReplies} />
            )}
          </View>
        </>
      ) : null}
    </View>
  );
};

export default Comment;

const s = StyleSheet.create({
  root: {
    minHeight: 62,
    marginBottom: 8,
  },
});

// Get the background color to highlight a comment or reply comment if user is replying to that comment
const getCommentBgColor = (replyToCommentId: number | undefined, commentId: number, isDarkMode: boolean) => {
  if (replyToCommentId && replyToCommentId === commentId) {
    return isDarkMode ? COLORS.sky[975] : COLORS.sky[100];
  }
  return undefined;
};
