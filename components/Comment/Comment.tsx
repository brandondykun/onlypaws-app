import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { axiosFetch } from "@/api/config";
import { deleteCommentLike, getCommentReplies, likeComment } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PaginatedPostCommentsResponse, PostCommentDetailed } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Text from "../Text/Text";

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

  const bgColor = replyToCommentId === comment.id ? (isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200]) : undefined;

  return (
    <View style={[s.root]}>
      <View style={[s.commentRoot, { backgroundColor: bgColor }]}>
        <View style={s.header}>
          <Text style={s.username}>{comment.profile.username}</Text>
          <Text lightColor={COLORS.zinc[950]} style={s.comment}>
            {comment.text}
          </Text>
        </View>
        <View style={s.likeContainer}>
          <Pressable
            hitSlop={10}
            onPress={() => handleHeartPress(comment.id)}
            testID={`comment-like-button-${comment.id}-${comment.liked}`}
          >
            <View style={s.buttonContainer}>
              <AntDesign
                name={comment.liked ? "heart" : "hearto"}
                size={15}
                color={comment.liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]}
              />
              <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.likeCountText}>
                {comment.likes_count ? abbreviateNumber(comment.likes_count) : ""}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={{ marginBottom: 6, paddingLeft: 12, alignItems: "flex-start" }}>
        <Pressable
          style={({ pressed }) => [
            s.replyButton,
            pressed && { opacity: 0.6 },
            {
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
            },
          ]}
          onPress={() => {
            onReplyPress(comment, comment);
            setTimeout(() => {
              // needs timeout to allow the keyboard to open before scrolling
              listRef.current?.scrollToIndex({ index: commentIndex, animated: true });
            }, 250);
          }}
          hitSlop={8}
        >
          <Text lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[400]} style={s.replyButtonText}>
            Reply
          </Text>
        </Pressable>
      </View>
      {comment.replies_count > 0 ? (
        <>
          <View style={{ padding: 0 }}>
            {comment.replies?.map((replyComment, index) => {
              const bgColor =
                replyToCommentId === replyComment.id ? (isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200]) : undefined;

              return (
                <View style={{ marginVertical: 12 }} key={index}>
                  <View style={{ paddingLeft: 28, flexDirection: "row", backgroundColor: bgColor }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.username}>{replyComment.profile.username}</Text>
                      <View style={{ marginBottom: 6 }}>
                        <Text style={s.comment}>
                          <Text darkColor={COLORS.sky[400]} lightColor={COLORS.sky[600]}>
                            @{`${replyComment.reply_to_comment_username} `}
                          </Text>
                          <Text lightColor={COLORS.zinc[950]} style={s.comment}>
                            {replyComment.text}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <View style={[s.likeContainer, { paddingRight: 12 }]}>
                      <Pressable
                        hitSlop={10}
                        onPress={() => {
                          if (replyComment.liked) {
                            handleUnlikeReply(replyComment.id);
                          } else {
                            handleLikeReply(replyComment.id);
                          }
                        }}
                      >
                        <View style={s.buttonContainer}>
                          <AntDesign
                            name={replyComment.liked ? "heart" : "hearto"}
                            size={15}
                            color={
                              replyComment.liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]
                            }
                          />
                          <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.likeCountText}>
                            {replyComment.likes_count ? abbreviateNumber(replyComment.likes_count) : ""}
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ paddingLeft: 28, alignItems: "flex-start" }}>
                    <Pressable
                      style={({ pressed }) => [
                        s.replyButton,
                        pressed && { opacity: 0.6 },
                        {
                          backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                        },
                      ]}
                      onPress={() => {
                        onReplyPress(comment, replyComment);
                        setTimeout(() => {
                          // needs timeout to allow the keyboard to open before scrolling
                          listRef.current?.scrollToIndex({ index: commentIndex, animated: true });
                        }, 250);
                      }}
                      hitSlop={8}
                    >
                      <Text lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[400]} style={s.replyButtonText}>
                        Reply
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={{ marginTop: 6, paddingLeft: 16, marginBottom: 12 }}>
            {hasFetchNextError || hasFetchRepliesError ? (
              <Pressable
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                onPress={hasFetchRepliesError ? fetchReplies : fetchNext}
                hitSlop={8}
              >
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center", width: 50 }}>
                  <Ionicons name="refresh" size={13} color={isDarkMode ? COLORS.red[500] : COLORS.zinc[800]} />
                  <Text darkColor={COLORS.red[500]} style={{ fontSize: 13, textDecorationLine: "underline" }}>
                    Retry
                  </Text>
                </View>
              </Pressable>
            ) : fetchNextLoading || fetchRepliesLoading ? (
              <ActivityIndicator
                color={COLORS.zinc[500]}
                style={{ alignItems: "flex-start", paddingLeft: 56, height: 14, width: 14 }}
              />
            ) : comment.replies_count !== comment.replies.length ? (
              <Pressable
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                onPress={initialReplyFetchComplete ? fetchNext : fetchReplies}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{ width: 24, height: 1, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300] }}
                  />
                  <Text lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]} style={s.viewRepliesButtonText}>
                    View {comment.replies_count - comment.replies.length} {comment.replies.length ? "more " : ""}
                    {comment.replies_count - comment.replies.length === 1 ? "reply" : "replies"}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                onPress={() => {
                  handleHideReplies(comment.id);
                  setFetchNextUrl(null);
                  setInitialReplyFetchComplete(false);
                }}
                hitSlop={8}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{ width: 24, height: 1, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300] }}
                  />
                  <Text lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]} style={s.viewRepliesButtonText}>
                    hide replies
                  </Text>
                </View>
              </Pressable>
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
  commentRoot: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 6,
    minHeight: 53,
  },
  header: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    marginBottom: 3,
    fontSize: 12,
    color: COLORS.zinc[500],
  },
  likeContainer: {
    marginTop: 4,
    paddingLeft: 28,
    justifyContent: "center",
  },
  comment: {
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
  },
  likeCountText: {
    fontSize: 14,
  },
  replyButton: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  viewRepliesButtonText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    marginHorizontal: 12,
  },
});
