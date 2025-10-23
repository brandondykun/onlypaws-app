import { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { axiosFetch } from "@/api/config";
import { deleteCommentLike, getCommentReplies, likeComment } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PaginatedPostCommentsResponse, PostCommentDetailed } from "@/types";

import ReplyComment from "./ReplyComment";
import MainComment from "./MainComment";
import MainCommentReplyButton from "./MainCommentReplyButton";
import ReplyCommentReplyButton from "./ReplyCommentReplyButton";
import HideRepliesButton from "./HideRepliesButton";
import ShowRepliesButton from "./ShowRepliesButton";
import FetchRepliesRetry from "./FetchRepliesRetry";

type Props = {
  comment: PostCommentDetailed;
  onLike: (commentId: number) => void;
  onUnlike: (commentId: number) => void;
  onReplyPress: (parentComment: PostCommentDetailed, replyingToComment: PostCommentDetailed) => void;
  handleAddReplies: (parentCommentId: number, replies: PostCommentDetailed[]) => void;
  handleHideReplies: (parentCommentId: number) => void;
  onLikeReply: (commentId: number, replyId: number) => void;
  onUnlikeReply: (commentId: number, replyId: number) => void;
  commentIndex: number;
  listRef: React.RefObject<BottomSheetFlatListMethods>;
  replyToCommentId?: number;
};

const Comment = ({
  comment,
  onLike,
  onUnlike,
  onReplyPress,
  handleAddReplies,
  handleHideReplies,
  onLikeReply,
  onUnlikeReply,
  listRef,
  commentIndex,
  replyToCommentId,
}: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();

  const [fetchRepliesLoading, setFetchRepliesLoading] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);
  const [hasFetchRepliesError, setHasFetchRepliesError] = useState(false);
  const [initialReplyFetchComplete, setInitialReplyFetchComplete] = useState(false);

  // handle liking a top level comment
  const handleLike = async (commentId: number) => {
    Haptics.impactAsync();
    onLike(commentId); // optimistic like
    const { error } = await likeComment(commentId, authProfile.id);
    if (error) {
      onUnlike(commentId); // revert like on error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error liking that comment.",
      });
    }
  };

  // handle un-liking a top level comment
  const handleUnlike = async (commentId: number) => {
    Haptics.selectionAsync();
    onUnlike(commentId); // optimistic unlike
    const { error } = await deleteCommentLike(commentId, authProfile.id);
    if (error) {
      onLike(commentId); // revert unlike on error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error removing that like.",
      });
    }
  };

  // wrapper function to call either like or unlike comment
  const handleHeartPress = (commentId: number) => {
    if (comment.liked) {
      handleUnlike(commentId);
    } else {
      handleLike(commentId);
    }
  };

  // fetch replies for the comment
  const fetchReplies = async () => {
    setFetchRepliesLoading(true);
    setHasFetchRepliesError(false);
    const { error, data } = await getCommentReplies(comment.post, comment.id);
    if (!error && data) {
      setFetchNextUrl(data.next);
      handleAddReplies(comment.id, data.results);
      setInitialReplyFetchComplete(true);
    } else {
      setHasFetchRepliesError(true);
    }
    setFetchRepliesLoading(false);
  };

  // fetch next paginated list of replies
  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data } = await axiosFetch<PaginatedPostCommentsResponse>(fetchNextUrl);
      if (!error && data) {
        handleAddReplies(comment.id, data.results);
        setFetchNextUrl(data.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl, comment.id, handleAddReplies]);

  // handle liking a nested reply comment
  const handleLikeReply = async (id: number) => {
    Haptics.impactAsync();
    onLikeReply(comment.id, id);
    const { error } = await likeComment(id, authProfile.id);
    if (error) {
      onUnlikeReply(comment.id, id);
    }
  };

  // handle un-liking a nested reply comment
  const handleUnlikeReply = async (id: number) => {
    Haptics.selectionAsync();
    onUnlikeReply(comment.id, id);
    const { error } = await deleteCommentLike(id, authProfile.id);
    if (error) {
      onLikeReply(comment.id, id);
    }
  };

  const bgColor = getCommentBgColor(replyToCommentId, comment.id, isDarkMode);

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
            {hasFetchNextError || hasFetchRepliesError ? (
              <FetchRepliesRetry onPress={hasFetchRepliesError ? fetchReplies : fetchNext} />
            ) : fetchNextLoading || fetchRepliesLoading ? (
              <ActivityIndicator
                color={COLORS.zinc[500]}
                style={{ alignItems: "flex-start", paddingLeft: 56, height: 14, width: 14 }}
              />
            ) : comment.replies_count !== comment.replies.length ? (
              <ShowRepliesButton
                onPress={initialReplyFetchComplete ? fetchNext : fetchReplies}
                commentRepliesCount={comment.replies_count}
                commentRepliesLength={comment.replies.length}
              />
            ) : (
              <HideRepliesButton
                onPress={() => {
                  handleHideReplies(comment.id);
                  setFetchNextUrl(null);
                  setInitialReplyFetchComplete(false);
                }}
              />
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

// get the background color to highlight a comment or reply comment if user is replying to that comment
const getCommentBgColor = (replyToCommentId: number | undefined, commentId: number, isDarkMode: boolean) => {
  if (replyToCommentId && replyToCommentId === commentId) {
    return isDarkMode ? COLORS.sky[975] : COLORS.sky[100];
  }
  return undefined;
};
