import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef, useRef, useState } from "react";
import React from "react";
import { StyleSheet, View } from "react-native";

import { deletePost as deletePostApiCall } from "@/api/post";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { usePostsContext } from "@/context/PostsContext";
import { PostReportPreview } from "@/types";
import toast from "@/utils/toast";

import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import OwnPostOptions from "./components/OwnPostOptions";
import PostOptions from "./components/PostOptions";
import ReportedMessage from "./components/ReportedMessage";
import ReportPostModal from "./components/ReportPostModal";

type Props = {
  onViewProfilePress: () => void;
  onLike: () => void;
  onUnlike: () => void;
  liked: boolean;
  postProfileId: number | null;
  postId: number;
  is_reported: boolean;
  is_hidden: boolean;
  reports: PostReportPreview[];
};

const PostMenu = forwardRef(
  (
    { onViewProfilePress, onLike, onUnlike, liked, postProfileId, postId, is_reported, is_hidden, reports }: Props,
    ref: ForwardedRef<RNBottomSheetModal>,
  ) => {
    const { setLightOrDark } = useColorMode();
    const { authProfile } = useAuthProfileContext();
    const { deletePost } = usePostsContext();
    const { onToggleHidden } = usePostManagerContext();

    const confirmDeleteModalRef = useRef<RNBottomSheetModal>(null);
    const confirmReportModalRef = useRef<RNBottomSheetModal>(null);

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isInappropriateContent, setIsInappropriateContent] = useState(false);

    const handlePostDelete = async () => {
      setDeleteLoading(true);
      const { error } = await deletePostApiCall(postId);
      if (!error) {
        deletePost(postId);
        if (typeof ref === "object") {
          confirmDeleteModalRef.current?.dismiss();
          ref?.current?.dismiss();
        }
        toast.success("Post successfully deleted.");
      } else {
        toast.error("There was an error deleting that post.");
      }
      setDeleteLoading(false);
    };

    const handleShowConfirmModal = () => {
      confirmDeleteModalRef.current?.present();
    };

    const handleShowConfirmReportModal = () => {
      confirmReportModalRef.current?.present();
      if (typeof ref === "object") {
        ref?.current?.dismiss();
      }
    };

    const handleHidePost = (postId: number) => {
      onToggleHidden(postId);
      if (typeof ref === "object") {
        ref?.current?.dismiss();
      }
    };

    return (
      <>
        {/* Main Post Options Menu */}
        <BottomSheetModal handleTitle="Post Options" ref={ref} enableDynamicSizing={true} snapPoints={[]}>
          <BottomSheetView style={[s.bottomSheetView, { paddingHorizontal: 36 }]}>
            <ReportedMessage
              reports={reports}
              isInappropriateContent={isInappropriateContent}
              setIsInappropriateContent={setIsInappropriateContent}
              postProfileId={postProfileId}
            />
            <View
              style={{
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[800]),
              }}
            >
              {postProfileId === authProfile.id ? (
                <OwnPostOptions
                  postId={postId}
                  modalRef={ref}
                  deleteLoading={deleteLoading}
                  handleShowConfirmModal={handleShowConfirmModal}
                />
              ) : (
                <PostOptions
                  handleShowConfirmReportModal={handleShowConfirmReportModal}
                  onViewProfilePress={onViewProfilePress}
                  onUnlike={onUnlike}
                  onLike={onLike}
                  liked={liked}
                  is_hidden={is_hidden}
                  is_reported={is_reported}
                  reports={reports}
                  handleHidePost={handleHidePost}
                  modalRef={ref}
                  postId={postId}
                />
              )}
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          confirmDeleteModalRef={confirmDeleteModalRef}
          deleteLoading={deleteLoading}
          handlePostDelete={handlePostDelete}
        />

        {/* Report Post Modal */}
        <ReportPostModal ref={confirmReportModalRef} postId={postId} />
      </>
    );
  },
);

PostMenu.displayName = "PostMenu";
export default PostMenu;

const s = StyleSheet.create({
  profileOption: {
    paddingVertical: 16,
  },
  bottomSheetView: {
    paddingTop: 24,
    paddingBottom: 56,
  },
  textInput: {
    fontSize: 16,
    minHeight: 120,
  },
});
