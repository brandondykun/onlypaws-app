import { BottomSheetModal as RNBottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, TextInput as RNTextInput, View, Easing } from "react-native";
import Toast from "react-native-toast-message";

import { reportPost } from "@/api/report";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import { ModalCard, ModalCardItemSeparator } from "@/components/ModalCard/ModalCard";
import Pressable from "@/components/Pressable/Pressable";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { useReportReasonsContext } from "@/context/ReportReasonsContext";

type Props = {
  ref: React.RefObject<RNBottomSheetModal | null>;
  postId: number;
};

const ReportPostModal = ({ ref, postId }: Props) => {
  const { setLightOrDark, isDarkMode } = useColorMode();
  const { data: reportReasons } = useReportReasonsContext();
  const { onReportPost } = usePostManagerContext();

  const reportDetailsInputRef = useRef<RNTextInput>(null);
  const reportDetailsValueRef = useRef("");

  const [reportLoading, setReportLoading] = useState(false);
  const [reportReasonId, setReportReasonId] = useState<number | null>(null);
  const [reportPostError, setReportPostError] = useState<string | null>(null);
  const [reportDetailsLength, setReportDetailsLength] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleReportPost = async () => {
    if (!reportReasonId) return;

    setReportLoading(true);
    setReportPostError(null);

    const { error, data } = await reportPost(postId, reportReasonId, reportDetailsValueRef.current);
    if (!error && data) {
      const is_inappropriate_content = reportReasonId === 1;
      // set post is_reported and is_hidden to true
      onReportPost(postId, is_inappropriate_content);
      // slight delay to allow the post to be updated in the state
      setTimeout(() => {
        ref.current?.dismiss();
        setReportLoading(false);
      }, 300);
      // another longer delay to allow the modal to be dismissed
      // this makes the ux smoother and more natural
      setTimeout(() => {
        resetReportState();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "That post has been reported. Thank you!",
          visibilityTime: 7000,
        });
      }, 500);
    } else {
      setReportPostError("There was an error reporting that post. Please try again.");
      setReportLoading(false);
    }
  };

  const handleReportReasonSelect = (reasonId: number) => {
    setReportReasonId(reasonId);

    // Animate slide transition
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const resetReportState = () => {
    setReportReasonId(null);
    reportDetailsInputRef.current?.clear();
    reportDetailsValueRef.current = "";
    setReportDetailsLength(0);
    setReportPostError(null);
    slideAnim.setValue(0);
  };

  const handleCancelReport = () => {
    ref.current?.dismiss();
    // Reset after animation completes
    setTimeout(() => {
      resetReportState();
    }, 300);
  };

  return (
    <BottomSheetModal
      handleTitle="Report Post"
      ref={ref}
      snapPoints={["80%"]}
      onDismiss={resetReportState}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={false}
    >
      <BottomSheetScrollView
        style={s.bottomSheetView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <View style={{ overflow: "hidden" }}>
          {/* Animated View to swipe between the reasons and details views */}
          <Animated.View
            style={{
              flexDirection: "row",
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [-Dimensions.get("window").width, 0],
                  }),
                },
              ],
            }}
          >
            {/* Reasons View */}
            <View style={{ width: Dimensions.get("window").width, paddingHorizontal: 36 }}>
              <Text style={s.reasonsPrimaryText}>Why would you like to report this post?</Text>
              <ModalCard>
                {reportReasons.map((reason, i) => {
                  return (
                    <View key={reason.id}>
                      <Pressable style={s.cardButton} onPress={() => handleReportReasonSelect(reason.id)}>
                        <Text style={{ textAlign: "center", fontSize: 18 }}>{reason.name}</Text>
                      </Pressable>
                      {i !== reportReasons.length - 1 ? <ModalCardItemSeparator /> : null}
                    </View>
                  );
                })}
              </ModalCard>
            </View>

            {/* Details View */}
            <View style={{ width: Dimensions.get("window").width, paddingHorizontal: 16 }}>
              <Text style={s.detailsPrimaryText}>Why would you like to report this post?</Text>
              <Text style={s.optionalText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
                (optional)
              </Text>
              <TextInput
                ref={reportDetailsInputRef}
                inputStyle={[
                  s.textInput,
                  {
                    backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[125],
                    color: isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900],
                    borderColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400],
                  },
                ]}
                placeholder="Please provide more details..."
                placeholderTextColor={COLORS.zinc[500]}
                defaultValue={reportDetailsValueRef.current}
                onChangeText={(text) => {
                  reportDetailsValueRef.current = text;
                  setReportDetailsLength(text.length);
                }}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={1000}
                editable={!reportLoading}
                autoComplete="off"
              />
              <View style={{ marginTop: -10 }}>
                <Text
                  style={{
                    textAlign: "right",
                    paddingRight: 2,
                    color:
                      reportDetailsLength >= 1000
                        ? COLORS.red[500]
                        : setLightOrDark(COLORS.zinc[800], COLORS.zinc[300]),
                  }}
                >
                  {Math.min(reportDetailsLength, 1000)}/1000
                </Text>
              </View>
              {reportPostError ? <Text style={s.reportErrorText}>{reportPostError}</Text> : null}
              <View style={{ marginTop: 24 }}>
                <Button
                  text="Submit Report"
                  onPress={handleReportPost}
                  loading={reportLoading}
                  disabled={reportLoading}
                />
              </View>
            </View>
          </Animated.View>
        </View>
        <View style={s.cancelButtonContainer}>
          <Button text="Cancel" variant="text" onPress={handleCancelReport} disabled={reportLoading} />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default ReportPostModal;

const s = StyleSheet.create({
  cardButton: {
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
  optionalText: {
    marginBottom: 24,
    fontSize: 18,
    paddingHorizontal: 12,
    textAlign: "center",
    fontWeight: "300",
  },
  reasonsPrimaryText: {
    marginBottom: 24,
    fontSize: 18,
    paddingHorizontal: 12,
    textAlign: "center",
    fontWeight: "300",
  },
  detailsPrimaryText: {
    fontSize: 18,
    paddingHorizontal: 12,
    textAlign: "center",
    fontWeight: "300",
  },
  reportErrorText: {
    marginTop: 24,
    fontSize: 16,
    color: COLORS.red[600],
    textAlign: "center",
  },
  cancelButtonContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: "flex-end",
  },
});
