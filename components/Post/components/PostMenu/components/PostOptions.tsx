import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { ForwardedRef } from "react";
import { StyleSheet } from "react-native";

import { ModalCard, ModalCardItemSeparator } from "@/components/ModalCard/ModalCard";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import Pressable from "@/shared/ui/Pressable/Pressable";
import Text from "@/shared/ui/Text/Text";
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
  dogVisionActive: boolean;
  handleToggleDogVision: () => void;
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
  dogVisionActive,
  handleToggleDogVision,
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
        <Ionicons name="paw" size={18} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[200])} />
        <Text style={{ textAlign: "center", fontSize: 18 }}>View Profile</Text>
      </Pressable>
      <ModalCardItemSeparator />
      <Pressable onPress={handleLikePress} disabled={is_hidden} style={s.cardButton}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={20}
          color={liked ? COLORS.red[600] : setLightOrDark(COLORS.zinc[900], COLORS.zinc[200])}
        />
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
      <Pressable onPress={handleToggleDogVision} disabled={is_hidden} style={s.cardButton}>
        <Ionicons
          name={dogVisionActive ? "glasses" : "glasses-outline"}
          size={26}
          color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])}
        />
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            color: is_hidden
              ? setLightOrDark(COLORS.zinc[400], COLORS.zinc[500])
              : setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]),
          }}
        >
          {dogVisionActive ? "View in Human Vision" : "View in Dog Vision"}
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
        <Ionicons name="alert-circle-outline" size={20} color={COLORS.red[600]} />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
});
