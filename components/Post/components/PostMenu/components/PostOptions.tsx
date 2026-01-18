import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { ForwardedRef } from "react";
import { StyleSheet } from "react-native";

import { ModalCard, ModalCardItemSeparator } from "@/components/ModalCard/ModalCard";
import Pressable from "@/components/Pressable/Pressable";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostReportPreview } from "@/types";

type Props = {
  handleShowConfirmReportModal: () => void;
  onViewProfilePress: () => void;
  onUnlike: () => void;
  onLike: () => void;
  liked: boolean;
  is_hidden: boolean;
  is_reported: boolean;
  reports: PostReportPreview[];
  handleHidePost: (postId: number) => void;
  modalRef: ForwardedRef<RNBottomSheetModal>;
  postId: number;
};

const PostOptions = ({
  handleShowConfirmReportModal,
  onViewProfilePress,
  onUnlike,
  onLike,
  liked,
  is_hidden,
  is_reported,
  reports,
  handleHidePost,
  modalRef,
  postId,
}: Props) => {
  const { setLightOrDark } = useColorMode();

  const handleLikePress = () => {
    if (liked) {
      onUnlike();
    } else {
      onLike();
    }
  };

  return (
    <ModalCard>
      <Pressable
        onPress={() => {
          onViewProfilePress();
          if (typeof modalRef === "object") {
            modalRef?.current?.dismiss();
          }
        }}
        style={s.cardButton}
      >
        <Text style={{ textAlign: "center", fontSize: 18 }}>View Profile</Text>
      </Pressable>
      <ModalCardItemSeparator />
      <Pressable onPress={handleLikePress} disabled={is_hidden} style={s.cardButton}>
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
      </Pressable>
      <ModalCardItemSeparator />
      {reports.length || is_reported ? (
        <>
          <Pressable onPress={() => handleHidePost(postId)} style={s.cardButton}>
            <Text style={{ textAlign: "center", fontSize: 18 }}>{is_hidden ? "Show Post" : "Hide Post"}</Text>
          </Pressable>
          <ModalCardItemSeparator />
        </>
      ) : null}
      <Pressable onPress={handleShowConfirmReportModal} disabled={is_reported} style={s.cardButton}>
        <Text style={{ textAlign: "center", fontSize: 18, color: COLORS.red[600] }}>
          {!is_reported ? "Report Post" : "Post has been reported"}
        </Text>
      </Pressable>
    </ModalCard>
  );
};

export default PostOptions;

const s = StyleSheet.create({
  cardButton: {
    paddingVertical: 16,
  },
});
