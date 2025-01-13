import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef, useRef, useState } from "react";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { deletePost as deletePostApiCall } from "@/api/post";
import { reportPost } from "@/api/report";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { usePostsContext } from "@/context/PostsContext";
import { useReportReasonsContext } from "@/context/ReportReasonsContext";
import { PostReportPreview } from "@/types";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import Button from "../Button/Button";
import Text from "../Text/Text";

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
    const { isDarkMode, setLightOrDark } = useColorMode();
    const { authProfile } = useAuthProfileContext();
    const { deletePost } = usePostsContext();
    const { data: reportReasons } = useReportReasonsContext();
    const { onReportPost, onToggleHidden } = usePostManagerContext();
    const confirmDeleteModalRef = useRef<RNBottomSheetModal>(null);
    const confirmReportModalRef = useRef<RNBottomSheetModal>(null);

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportLoadingReasonId, setReportLoadingReasonId] = useState<number | null>(null);
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
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Post successfully deleted.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error deleting that post.",
        });
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

    const handleReportPost = async (reasonId: number) => {
      setReportLoading(true);
      setReportLoadingReasonId(reasonId);

      const { error, data } = await reportPost(postId, reasonId, "");
      if (!error && data) {
        const is_inappropriate_content = reasonId === 1;
        // set post is_reported and is_hidden to true
        onReportPost(postId, is_inappropriate_content);
        confirmReportModalRef.current?.dismiss();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "This post has been reported. Thank you!",
          visibilityTime: 10000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error reporting that post.",
        });
      }
      setReportLoading(false);
      setReportLoadingReasonId(null);
    };

    const reportReasonsArray: string[] = [];

    reports.forEach((reason) => {
      if (reason.reason.id === 1 && !isInappropriateContent) {
        setIsInappropriateContent(true);
      }
      if (!reportReasonsArray.includes(reason.reason.name)) {
        reportReasonsArray.push(reason.reason.name);
      }
    });

    return (
      <>
        <BottomSheetModal handleTitle="Post Options" ref={ref} enableDynamicSizing={true} snapPoints={[]}>
          <BottomSheetView style={s.bottomSheetView}>
            {reports.length ? (
              <View style={{ marginBottom: authProfile.id === postProfileId ? 36 : 0 }}>
                <View style={{ marginBottom: 16, alignItems: "center" }}>
                  <Ionicons name="alert-circle-outline" size={48} color={COLORS.red[600]} />
                </View>
                <Text darkColor={COLORS.zinc[200]} style={{ fontSize: 18, marginBottom: 24, textAlign: "center" }}>
                  This post has been reported for:
                </Text>
                <View style={{ marginBottom: 12 }}>
                  {reportReasonsArray.map((reason, i) => {
                    return (
                      <View key={i}>
                        <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600", marginBottom: 4 }}>
                          {reason}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text
                  darkColor={COLORS.zinc[400]}
                  style={{ fontSize: 18, textAlign: "center", marginTop: 24, fontWeight: 300 }}
                >
                  {postProfileId === authProfile.id
                    ? isInappropriateContent
                      ? "This post has been reported as inappropriate. Other users cannot see it until it is reviewed."
                      : "Other users can still see this post, but the images are initially hidden."
                    : ""}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
              }}
            >
              {postProfileId === authProfile.id ? (
                <>
                  <Pressable
                    style={({ pressed }) => [
                      pressed && !deleteLoading ? { opacity: 0.5 } : deleteLoading ? { opacity: 0.5 } : null,
                    ]}
                    onPress={handleShowConfirmModal}
                    disabled={deleteLoading}
                  >
                    <View style={[s.profileOption]}>
                      <Text style={{ textAlign: "center", fontSize: 18 }}>Delete Post</Text>
                    </View>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      onViewProfilePress();
                      if (typeof ref === "object") {
                        ref?.current?.dismiss();
                      }
                    }}
                  >
                    <View
                      style={[
                        s.profileOption,
                        { borderBottomWidth: 1, borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400] },
                      ]}
                    >
                      <Text style={{ textAlign: "center", fontSize: 18 }}>View Profile</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [pressed && !is_hidden && { opacity: 0.7 }]}
                    onPress={() => {
                      if (liked) {
                        onUnlike();
                      } else {
                        onLike();
                      }
                    }}
                    disabled={is_hidden}
                  >
                    <View
                      style={[
                        s.profileOption,
                        { borderBottomWidth: 1, borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400] },
                      ]}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 18,
                          color: is_hidden
                            ? setLightOrDark(COLORS.zinc[400], COLORS.zinc[500])
                            : setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]),
                        }}
                      >
                        {liked ? "Unlike Post" : "Like Post"}
                      </Text>
                    </View>
                  </Pressable>
                  {reports.length ? (
                    <Pressable
                      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                      onPress={() => handleHidePost(postId)}
                    >
                      <View
                        style={[
                          s.profileOption,
                          { borderBottomWidth: 1, borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400] },
                        ]}
                      >
                        <Text style={{ textAlign: "center", fontSize: 18 }}>
                          {is_hidden ? "Show Post" : "Hide Post"}
                        </Text>
                      </View>
                    </Pressable>
                  ) : null}
                  <Pressable
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                    onPress={handleShowConfirmReportModal}
                    disabled={is_reported}
                  >
                    <View style={[s.profileOption]}>
                      <Text style={{ textAlign: "center", fontSize: 18, color: COLORS.red[600] }}>
                        {!is_reported ? "Report Post" : "Post has been reported"}
                      </Text>
                    </View>
                  </Pressable>
                </>
              )}
            </View>
          </BottomSheetView>
        </BottomSheetModal>
        <BottomSheetModal
          handleTitle="Confirm Delete"
          ref={confirmDeleteModalRef}
          enableDynamicSizing={true}
          snapPoints={[]}
        >
          <BottomSheetView style={s.bottomSheetView}>
            <Text style={{ marginBottom: 8, fontSize: 18 }}>Are you sure you want to delete this post?</Text>
            <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={{ marginBottom: 24, fontSize: 16 }}>
              This action cannot be undone.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button
                  text="Delete"
                  buttonStyle={{ backgroundColor: COLORS.red[500] }}
                  onPress={handlePostDelete}
                  loading={deleteLoading}
                  testID="delete-post-button"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  text="Cancel"
                  onPress={() => confirmDeleteModalRef.current?.dismiss()}
                  disabled={deleteLoading}
                />
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        <BottomSheetModal
          handleTitle="Report Post"
          ref={confirmReportModalRef}
          enableDynamicSizing={true}
          snapPoints={[]}
        >
          <BottomSheetView style={s.bottomSheetView}>
            <Text
              style={{ marginBottom: 24, fontSize: 18, paddingHorizontal: 12, textAlign: "center", fontWeight: 300 }}
            >
              Why would you like to report this post?
            </Text>
            <View
              style={{
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
              }}
            >
              {reportReasons.map((reason, i) => {
                return (
                  <Pressable
                    style={({ pressed }) => [(pressed || reportLoading) && { opacity: 0.7 }]}
                    onPress={() => handleReportPost(reason.id)}
                    disabled={reportLoading}
                    key={i}
                  >
                    <View
                      style={[
                        s.profileOption,
                        {
                          borderBottomWidth: i === reportReasons.length - 1 ? 0 : 1,
                          borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400],
                        },
                      ]}
                    >
                      {reportLoadingReasonId === reason.id ? (
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                          <ActivityIndicator size={20} />
                        </View>
                      ) : (
                        <Text style={{ textAlign: "center", fontSize: 18 }}>{reason.name}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ marginTop: 24 }}>
              <Button
                text="Cancel"
                variant="secondary"
                buttonStyle={{ backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300] }}
                onPress={() => confirmReportModalRef.current?.dismiss()}
              />
            </View>
          </BottomSheetView>
        </BottomSheetModal>
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
    paddingBottom: 48,
    paddingHorizontal: 36,
  },
});
