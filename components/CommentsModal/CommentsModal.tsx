import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView, BottomSheetFlashList } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useState, useCallback, forwardRef, ForwardedRef, useRef } from "react";
import { View, Pressable, ActivityIndicator, StyleSheet, RefreshControl, Platform, Keyboard } from "react-native";
import { TextInput as RNGHTestInput } from "react-native-gesture-handler";
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
import CommentSkeleton from "../LoadingSkeletons/CommentSkeleton";
import Text from "../Text/Text";

type Props = {
  addCommentToPost: (comment: PostCommentDetailed) => void;
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

    const { isDarkMode } = useColorMode();
    const { authProfile } = useAuthProfileContext();
    const commentInputRef = useRef<RNGHTestInput>(null);
    const inputValueRef = useRef("");

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

    const handleAddComment = useCallback(async () => {
      if (postId && inputValueRef.current) {
        setAddCommentLoading(true);
        const { error, data } = await addComment(postId, inputValueRef.current, authProfile.id);
        if (!error && data) {
          setComments((prev) => [data, ...prev]);
          addCommentToPost(data);
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
    }, [addCommentToPost, authProfile.id, postId]);

    const onClose = useCallback(() => {
      commentInputRef.current?.clear();
      inputValueRef.current = "";
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
      <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>
        <ActivityIndicator color={COLORS.zinc[500]} size="small" />
      </View>
    ) : hasFetchNextError ? (
      <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: COLORS.red[600], textAlign: "center" }}>
          Oh no! There was an error fetching more comments.
        </Text>
        <Button text="Retry" variant="text" onPress={() => fetchNext()} />
      </View>
    ) : null;

    return (
      <BottomSheetModal ref={ref} onChange={handleSheetChanges} onDismiss={onClose} handleTitle="Comments">
        <BottomSheetView style={{ flex: 1 }}>
          <BottomSheetFlashList
            data={comments}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyExtractor={(item) => item.id.toString()}
            onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
            onEndReached={!fetchNextLoading ? () => fetchNext() : null}
            ListEmptyComponent={emptyComponent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            estimatedItemSize={60}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshComments}
                tintColor={COLORS.zinc[400]}
                colors={[COLORS.zinc[400]]}
              />
            }
            renderItem={({ item }) => (
              <Comment comment={item} onLike={handleLikeComment} onUnlike={handleUnlikeComment} />
            )}
            ListFooterComponent={footerComponent}
          />
          <View
            style={{
              paddingHorizontal: 16,
              flexDirection: "row",
              gap: 8,
              paddingTop: 12,
              alignItems: "center",
              paddingBottom: Platform.OS === "ios" ? 24 : 18,
              borderTopColor: isDarkMode ? DARK_BORDER_COLOR : COLORS.zinc[300],
              borderTopWidth: 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <BottomSheetTextInput
                placeholder="Add comment..."
                ref={commentInputRef}
                defaultValue={inputValueRef.current}
                onChangeText={(text) => (inputValueRef.current = text)}
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
                  <AntDesign name="arrowup" size={24} color={COLORS.zinc[100]} />
                ) : (
                  <ActivityIndicator size="small" color={COLORS.zinc[200]} />
                )}
              </View>
            </Pressable>
          </View>
        </BottomSheetView>
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
