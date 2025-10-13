import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetModal as RNBottomSheetModal,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useState, useCallback, forwardRef, ForwardedRef, useRef } from "react";
import { View, Pressable, ActivityIndicator, StyleSheet, RefreshControl, Platform, Keyboard } from "react-native";
import { TextInput as RNGHTextInput } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { axiosFetch } from "@/api/config";
import { addComment, getPostComments } from "@/api/post";
import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PaginatedPostCommentsResponse, PostCommentDetailed } from "@/types";

import BottomSheetModal, { BottomSheetTextInput } from "../BottomSheet/BottomSheet";
import { DARK_BORDER_COLOR } from "../BottomSheet/BottomSheet";
import Button from "../Button/Button";
import Comment from "../Comment/Comment";
import LoadingFooter from "../LoadingFooter/LoadingFooter";
import CommentSkeleton from "../LoadingSkeletons/CommentSkeleton";
import RetryFetchFooter from "../RetryFetchFooter/RetryFetchFooter";
import Text from "../Text/Text";

type Props = {
  addCommentToPost: () => void;
  postId: number | null;
};

const CommentsModal = forwardRef(
  ({ addCommentToPost, postId }: Props, ref: ForwardedRef<RNBottomSheetModal<any>> | undefined) => {
    // form state
    const [addCommentLoading, setAddCommentLoading] = useState(false);
    // fetching data state
    const [comments, setComments] = useState<PostCommentDetailed[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
    const [initialFetchComplete, setInitialFetchComplete] = useState(false);
    const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
    const [fetchNextLoading, setFetchNextLoading] = useState(false);
    const [hasFetchNextError, setHasFetchNextError] = useState(false);

    // top level comment with nested replies
    const [parentComment, setParentComment] = useState<PostCommentDetailed | null>(null);
    // specific comment being replied to
    const [replyToComment, setReplyToComment] = useState<PostCommentDetailed | null>(null);

    const { isDarkMode } = useColorMode();
    const { authProfile } = useAuthProfileContext();
    const commentInputRef = useRef<RNGHTextInput>(null); // comment input component ref
    const inputValueRef = useRef(""); // comment text ref
    const flatListRef = useRef<BottomSheetFlatListMethods>(null); // ref to comments flat list

    // like a top level comment
    const handleLikeComment = (commentId: number) => {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, liked: true, likes_count: comment.likes_count + 1 };
          }
          return comment;
        }),
      );
    };

    // unlike a top level comment
    const handleUnlikeComment = (commentId: number) => {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, liked: false, likes_count: comment.likes_count - 1 };
          }
          return comment;
        }),
      );
    };

    const handleReplyPress = (parentComment: PostCommentDetailed, replyingToComment: PostCommentDetailed) => {
      setParentComment(parentComment);
      setReplyToComment(replyingToComment);
      commentInputRef.current?.focus();
    };

    // initial fetch or refresh fetch if initial fetch fails
    const fetchComments = useCallback(async () => {
      if (postId) {
        setHasInitialFetchError(false);
        setHasFetchNextError(false);
        const { error, data } = await getPostComments(postId);
        if (!error && data) {
          setComments(data.results);
          setFetchNextUrl(data.next);
        } else {
          setHasInitialFetchError(true);
        }
        setInitialFetchComplete(true);
        setRefreshing(false);
      }
    }, [postId]);

    // refresh comments fetch if user swipes down
    const refreshComments = async () => {
      setRefreshing(true);
      Haptics.impactAsync();
      await fetchComments();
      setRefreshing(false);
    };

    // fetch comments when modal is opened
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index > -1) {
          fetchComments();
        } else {
          setInitialFetchComplete(false);
          setFetchNextUrl(null);
          setComments([]);
        }
      },
      [fetchComments],
    );

    // fetch next paginated list of comments
    const fetchNext = useCallback(async () => {
      if (fetchNextUrl) {
        setFetchNextLoading(true);
        setHasFetchNextError(false);
        const { error, data } = await axiosFetch<PaginatedPostCommentsResponse>(fetchNextUrl);
        if (!error && data) {
          setComments((prev) => [...prev, ...data.results]);
          setFetchNextUrl(data.next);
        } else {
          setHasFetchNextError(true);
        }
        setFetchNextLoading(false);
      }
    }, [fetchNextUrl]);

    // add a single reply to a comment so it displays nested under the top level comment
    // this is used when a user manually adds a reply
    const handleAddReply = (parentCommentId: number, reply: PostCommentDetailed) => {
      setComments((prev) => {
        return prev.map((prevComment) => {
          if (prevComment.id === parentCommentId) {
            return {
              ...prevComment,
              replies_count: prevComment.replies_count + 1,
              replies: [...prevComment.replies, reply],
            };
          }
          return prevComment;
        });
      });
    };

    // add multiple replies to a comment so they display nested under the top level comment
    // this is used when a user fetches multiple replies for a top level comment
    const handleAddReplies = (parentCommentId: number, replies: PostCommentDetailed[]) => {
      setComments((prev) => {
        return prev.map((prevComment) => {
          if (prevComment.id === parentCommentId) {
            // filter added replies to remove duplicate replies
            // this can happen if a user adds a comment and then fetches more comments.
            // It will eventually return the newly added comment that was added
            // on the front end without an api call
            const currentReplies = prevComment.replies.map((reply) => reply.id);
            const newFilteredReplies = replies.filter((reply) => !currentReplies.includes(reply.id));
            return { ...prevComment, replies: [...prevComment.replies, ...newFilteredReplies] };
          }
          return prevComment;
        });
      });
    };

    // clear replies array for a comment to visually hide the replies
    const handleHideReplies = (parentCommentId: number) => {
      setComments((prev) => {
        return prev.map((prevComment) => {
          if (prevComment.id === parentCommentId) {
            return { ...prevComment, replies: [] };
          }
          return prevComment;
        });
      });
    };

    // like a nested reply comment
    const handleLikeReply = (commentId: number, replyId: number) => {
      setComments((prev) =>
        prev.map((comment) => {
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
      );
    };

    // unlike a nested reply comment
    const handleUnlikeReply = (commentId: number, replyId: number) => {
      setComments((prev) =>
        prev.map((comment) => {
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
      );
    };

    // handle adding a comment or reply
    // if a parent comment is selected, a reply will be added
    // else a top level comment will be added
    const handleAddComment = useCallback(async () => {
      if (postId && inputValueRef.current) {
        setAddCommentLoading(true);
        const parentId = parentComment ? parentComment.id : null;
        const replyCommentId = replyToComment ? replyToComment.id : null;

        const { error, data } = await addComment(
          postId,
          inputValueRef.current,
          authProfile.id,
          parentId,
          replyCommentId,
        );
        if (!error && data) {
          if (!parentId) {
            setComments((prev) => [data, ...prev]); // add top level comment
          } else {
            handleAddReply(parentId, data); // add a nested reply
          }
          addCommentToPost(); // update comments count for the post - to show on main post
          Keyboard.dismiss();
          commentInputRef.current?.clear();
          inputValueRef.current = "";
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "There was an error adding that comment.",
          });
        }
        setAddCommentLoading(false);
      }
    }, [addCommentToPost, authProfile.id, postId, parentComment, replyToComment]);

    const onClose = useCallback(() => {
      commentInputRef.current?.clear();
      inputValueRef.current = "";
      setParentComment(null);
      setReplyToComment(null);
    }, []);

    // content to show in flat list if data is empty or loading
    const emptyComponent =
      !initialFetchComplete || refreshing ? (
        <CommentSkeleton />
      ) : hasInitialFetchError ? (
        <View style={{ paddingTop: 96, paddingHorizontal: 36 }}>
          <Text style={{ textAlign: "center", fontSize: 16, color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600] }}>
            There was an error fetching those comments.
          </Text>
          <View style={{ paddingTop: 24, alignItems: "center" }}>
            <Button
              text="Retry"
              variant="text"
              icon={
                <Ionicons name="refresh-sharp" size={20} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900]} />
              }
              onPress={refreshComments}
            />
          </View>
        </View>
      ) : !refreshing ? (
        <View style={{ padding: 48, paddingTop: 96, flex: 1, justifyContent: "center", gap: 16 }}>
          <Text
            darkColor={COLORS.zinc[400]}
            lightColor={COLORS.zinc[700]}
            style={{ textAlign: "center", fontSize: 20 }}
          >
            No comments yet.
          </Text>
          <Text style={{ color: COLORS.zinc[500], textAlign: "center", fontSize: 18, fontWeight: "300" }}>
            Add a comment to start the conversation!
          </Text>
        </View>
      ) : null;

    // content to be displayed in the footer
    const footerComponent = fetchNextLoading ? (
      <LoadingFooter />
    ) : hasFetchNextError ? (
      <RetryFetchFooter
        fetchFn={fetchNext}
        message="Oh no! There was an error fetching more comments!"
        buttonText="Retry"
      />
    ) : null;

    return (
      <BottomSheetModal ref={ref} onChange={handleSheetChanges} onDismiss={onClose} handleTitle="Comments">
        <BottomSheetFlatList
          ref={flatListRef}
          data={comments}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyExtractor={(item: PostCommentDetailed) => item.id.toString()}
          onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
          onEndReached={!fetchNextLoading ? () => fetchNext() : null}
          ListEmptyComponent={emptyComponent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshComments}
              tintColor={COLORS.zinc[400]}
              colors={[COLORS.zinc[400]]}
            />
          }
          renderItem={({ item, index }: { item: PostCommentDetailed; index: number }) => (
            <Comment
              comment={item}
              onLike={handleLikeComment}
              onUnlike={handleUnlikeComment}
              onReplyPress={handleReplyPress}
              handleAddReplies={handleAddReplies}
              handleHideReplies={handleHideReplies}
              onLikeReply={handleLikeReply}
              onUnlikeReply={handleUnlikeReply}
              commentIndex={index}
              listRef={flatListRef as React.RefObject<BottomSheetFlatListMethods>}
              replyToCommentId={replyToComment?.id}
            />
          )}
          ListFooterComponent={footerComponent}
        />
        <View
          style={{
            paddingBottom: Platform.OS === "ios" ? 24 : 18,
            borderTopColor: isDarkMode ? DARK_BORDER_COLOR : COLORS.zinc[300],
            borderTopWidth: 1,
          }}
        >
          <View>
            {parentComment ? (
              <View style={{ paddingTop: 12 }}>
                <Text darkColor={COLORS.sky[500]} lightColor={COLORS.sky[600]} style={{ paddingHorizontal: 18 }}>
                  replying to @{replyToComment?.profile?.username}: <Text>{replyToComment?.text}</Text>
                </Text>
              </View>
            ) : null}
          </View>
          <View style={{ paddingHorizontal: 16, flexDirection: "row", gap: 8, paddingTop: 12, alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <BottomSheetTextInput
                placeholder={parentComment ? `Reply to @${parentComment.profile.username}...` : "Add comment..."}
                ref={commentInputRef}
                defaultValue={inputValueRef.current}
                onChangeText={(text) => (inputValueRef.current = text)}
                onBlur={() => {
                  if (!inputValueRef.current) {
                    // if input has text don't clear the parent and reply to comment
                    setParentComment(null);
                    setReplyToComment(null);
                  }
                }}
              />
            </View>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed || addCommentLoading ? 0.5 : 1 }]}
              onPress={handleAddComment}
              disabled={addCommentLoading}
              testID="add-comment-button"
            >
              <View style={s.addCommentButton}>
                {!addCommentLoading ? (
                  <Ionicons name="arrow-up-outline" size={24} color={COLORS.zinc[100]} />
                ) : (
                  <ActivityIndicator size="small" color={COLORS.zinc[200]} />
                )}
              </View>
            </Pressable>
          </View>
        </View>
        <Toast config={toastConfig} />
      </BottomSheetModal>
    );
  },
);

CommentsModal.displayName = "CommentsModal";
export default CommentsModal;

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  backgroundOpacity: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.zinc[950],
    opacity: 0.5,
  },
  backgroundPressable: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    height: "80%",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingBottom: 16,
    paddingTop: 16,
    position: "relative",
  },
  addCommentButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.sky[600],
    width: 45,
    height: 45,
    borderRadius: 45,
  },
});
