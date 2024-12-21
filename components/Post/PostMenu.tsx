import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { deletePost as deletePostApiCall } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostsContext } from "@/context/PostsContext";

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
};

const PostMenu = forwardRef(
  (
    { onViewProfilePress, onLike, onUnlike, liked, postProfileId, postId }: Props,
    ref: ForwardedRef<RNBottomSheetModal>,
  ) => {
    const { isDarkMode } = useColorMode();
    const { authProfile } = useAuthProfileContext();
    const { deletePost } = usePostsContext();
    const confirmDeleteModalRef = useRef<RNBottomSheetModal>(null);

    const [deleteLoading, setDeleteLoading] = useState(false);

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

    return (
      <>
        <BottomSheetModal handleTitle="Post Options" ref={ref} enableDynamicSizing={true} snapPoints={[]}>
          <BottomSheetView style={s.bottomSheetView}>
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
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      if (liked) {
                        onUnlike();
                      } else {
                        onLike();
                      }
                    }}
                  >
                    <View style={[s.profileOption]}>
                      <Text style={{ textAlign: "center", fontSize: 18 }}>{liked ? "Unlike Post" : "Like Post"}</Text>
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
