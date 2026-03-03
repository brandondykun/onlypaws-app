import {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetModal as RNBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState, useCallback, forwardRef, ForwardedRef, useRef, useMemo } from "react";
import { RefreshControl, Keyboard } from "react-native";
import Toast from "react-native-toast-message";

import { addComment, deleteComment, getPostCommentsForQuery } from "@/api/interactions";
import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useNotificationsContext } from "@/context/NotificationsContext";
import useCommentsCacheUpdaters from "@/hooks/useCommentsCacheUpdaters";
import { PostCommentDetailed } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";
import toast from "@/utils/toast";
import { getNextPageParam } from "@/utils/utils";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import Comment from "../Comment/Comment";
import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "../ListEmptyComponent/ListEmptyComponent";
import CommentSkeleton from "../LoadingSkeletons/CommentSkeleton";

import CommentInputFooter, { CommentInputFooterRef } from "./components/CommentInputFooter";
import ConfirmDeleteCommentModal from "./components/ConfirmDeleteCommentModal";
import CustomEmptyComponent from "./components/CustomEmptyComponent";
import CustomErrorComponent from "./components/CustomErrorComponent";

type Props = {
  addCommentToPost: () => void;
  postId: number | null;
  postProfileId: number | null;
};

const CommentsModal = forwardRef(
  ({ addCommentToPost, postId, postProfileId }: Props, ref: ForwardedRef<RNBottomSheetModal<any>> | undefined) => {
    const { authProfile, selectedProfileId } = useAuthProfileContext();
    const { removeNotificationsForComment } = useNotificationsContext();
    const queryClient = useQueryClient();

    // form state
    const [addCommentLoading, setAddCommentLoading] = useState(false);
    // modal open state to control query enabled
    const [isModalOpen, setIsModalOpen] = useState(false);

    // top level comment with nested replies
    const [parentComment, setParentComment] = useState<PostCommentDetailed | null>(null);
    // specific comment being replied to
    const [replyToComment, setReplyToComment] = useState<PostCommentDetailed | null>(null);
    // error text for the comment input
    const [errorText, setErrorText] = useState("");

    // comment deletion state
    const [commentToDelete, setCommentToDelete] = useState<{
      id: number;
      parentCommentId?: number;
    } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const confirmDeleteCommentModalRef = useRef<RNBottomSheetModal>(null);
    const commentInputFooterRef = useRef<CommentInputFooterRef>(null);
    const flatListRef = useRef<BottomSheetFlatListMethods>(null); // ref to comments flat list

    const isPostOwner = postProfileId === authProfile.id;

    // Query key for comments
    const commentsQueryKey = useMemo(
      () => queryKeys.comments.post(selectedProfileId, postId as number),
      [postId, selectedProfileId],
    );

    // Cache updaters for comments
    const { addReply, prependComment, markCommentAsDeleted, markReplyAsDeleted } =
      useCommentsCacheUpdaters(commentsQueryKey);

    // Fetch comments using useInfiniteQuery
    const commentsQuery = useInfiniteQuery({
      queryKey: commentsQueryKey,
      queryFn: async ({ pageParam }) => {
        const response = await getPostCommentsForQuery(postId!, pageParam);
        return response.data;
      },
      initialPageParam: "1",
      getNextPageParam: (lastPage) => getNextPageParam(lastPage),
      enabled: !!postId && isModalOpen,
    });

    // Memoize flattened comments for the FlatList
    const comments = useMemo(
      () => commentsQuery.data?.pages.flatMap((page) => page.results) ?? [],
      [commentsQuery.data],
    );

    const handleReplyPress = (parentComment: PostCommentDetailed, replyingToComment: PostCommentDetailed) => {
      setParentComment(parentComment);
      setReplyToComment(replyingToComment);
      commentInputFooterRef.current?.focus();
    };

    // refresh comments fetch if user swipes down
    const refreshComments = async () => {
      Haptics.impactAsync();
      await commentsQuery.refetch();
    };

    // handle modal open/close state changes
    const handleSheetChanges = useCallback(
      (index: number) => {
        setIsModalOpen(index > -1);
        if (index === -1) {
          // Reset query when modal closes
          queryClient.removeQueries({ queryKey: commentsQueryKey });
        }
      },
      [queryClient, commentsQueryKey],
    );

    // handle end reached for pagination
    const handleEndReached = () => {
      const hasErrors = commentsQuery.isError || commentsQuery.isFetchNextPageError;
      const isLoading = commentsQuery.isLoading || commentsQuery.isFetchingNextPage;

      if (commentsQuery.hasNextPage && !hasErrors && !isLoading) {
        commentsQuery.fetchNextPage();
      }
    };

    // handle adding a comment or reply
    // if a parent comment is selected, a reply will be added
    // else a top level comment will be added
    const handleAddComment = useCallback(
      async (text: string) => {
        if (postId && text) {
          setAddCommentLoading(true);
          const parentId = parentComment ? parentComment.id : null;
          const replyCommentId = replyToComment ? replyToComment.id : null;

          setErrorText("");
          const { error, data, textError } = await addComment(postId, text, authProfile.id, parentId, replyCommentId);
          if (!error && data) {
            if (!parentId) {
              prependComment(data); // add top level comment
            } else {
              addReply(parentId, data); // add a nested reply
            }
            addCommentToPost(); // update comments count for the post - to show on main post
            Keyboard.dismiss();
            commentInputFooterRef.current?.clear();
            setParentComment(null);
            setReplyToComment(null);
          } else if (textError) {
            setErrorText(textError);
          } else {
            toast.error("There was an error adding that comment.");
          }
          setAddCommentLoading(false);
        }
      },
      [addCommentToPost, authProfile.id, postId, parentComment, replyToComment, prependComment, addReply],
    );

    // handle long press on a comment to initiate deletion
    const handleLongPressComment = useCallback((comment: PostCommentDetailed, parentCommentId?: number) => {
      Haptics.impactAsync();
      setCommentToDelete({ id: comment.id, parentCommentId });
      confirmDeleteCommentModalRef.current?.present();
    }, []);

    // handle deleting a comment after confirmation
    const handleDeleteComment = useCallback(async () => {
      if (!commentToDelete || !postId) return;
      setDeleteLoading(true);

      const { error } = await deleteComment(commentToDelete.id);
      if (!error) {
        if (commentToDelete.parentCommentId) {
          markReplyAsDeleted(commentToDelete.parentCommentId, commentToDelete.id);
        } else {
          markCommentAsDeleted(commentToDelete.id);
        }
        removeNotificationsForComment(commentToDelete.id);
        confirmDeleteCommentModalRef.current?.dismiss();
      } else {
        toast.error("There was an error deleting that comment.", { position: "top", topOffset: 0 });
      }

      setDeleteLoading(false);
      setCommentToDelete(null);
    }, [commentToDelete, postId, markCommentAsDeleted, markReplyAsDeleted, removeNotificationsForComment]);

    const onClose = useCallback(() => {
      commentInputFooterRef.current?.clear();
      setParentComment(null);
      setReplyToComment(null);
    }, []);

    return (
      <BottomSheetModal ref={ref} onChange={handleSheetChanges} onDismiss={onClose} handleTitle="Comments">
        <BottomSheetFlatList
          ref={flatListRef}
          data={comments}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          keyExtractor={(item: PostCommentDetailed) => item.id.toString()}
          onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
          onEndReached={handleEndReached}
          showsVerticalScrollIndicator={false}
          refreshing={commentsQuery.isRefetching}
          ListEmptyComponent={
            <ListEmptyComponent
              isLoading={commentsQuery.isPending}
              isError={commentsQuery.isError}
              isRefetching={commentsQuery.isRefetching}
              loadingComponent={<CommentSkeleton />}
              customErrorComponent={<CustomErrorComponent refetch={refreshComments} />}
              customEmptyComponent={<CustomEmptyComponent />}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={commentsQuery.isRefetching}
              onRefresh={refreshComments}
              tintColor={COLORS.zinc[400]}
              colors={[COLORS.zinc[400]]}
            />
          }
          renderItem={({ item, index }: { item: PostCommentDetailed; index: number }) => (
            <Comment
              comment={item}
              onReplyPress={handleReplyPress}
              commentIndex={index}
              listRef={flatListRef as React.RefObject<BottomSheetFlatListMethods>}
              replyToCommentId={replyToComment?.id}
              commentsQueryKey={commentsQueryKey}
              isPostOwner={isPostOwner}
              onLongPressComment={isPostOwner ? handleLongPressComment : undefined}
              deleteCommentId={commentToDelete?.id}
            />
          )}
          ListFooterComponent={
            <LoadingRetryFooter
              isLoading={commentsQuery.isFetchingNextPage}
              isError={commentsQuery.isFetchNextPageError}
              fetchNextPage={commentsQuery.fetchNextPage}
              message="Oh no! There was an error fetching more comments!"
            />
          }
        />
        <CommentInputFooter
          ref={commentInputFooterRef}
          replyToComment={replyToComment}
          parentComment={parentComment}
          onClearReply={() => {
            setParentComment(null);
            setReplyToComment(null);
          }}
          onSubmit={handleAddComment}
          isSubmitting={addCommentLoading}
          errorText={errorText}
          setErrorText={setErrorText}
        />
        <Toast config={toastConfig} />
        <ConfirmDeleteCommentModal
          confirmDeleteCommentModalRef={confirmDeleteCommentModalRef}
          deleteLoading={deleteLoading}
          handleDeleteComment={handleDeleteComment}
          onDismiss={() => setCommentToDelete(null)}
        />
      </BottomSheetModal>
    );
  },
);

CommentsModal.displayName = "CommentsModal";
export default CommentsModal;
