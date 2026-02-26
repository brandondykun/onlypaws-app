import { BottomSheetModal as RNBottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, TextInput as RNTextInput, View, Easing } from "react-native";

import { reportProfile } from "@/api/profile-report";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import { ModalCard, ModalCardItemSeparator } from "@/components/ModalCard/ModalCard";
import Pressable from "@/components/Pressable/Pressable";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useProfileReportReasonsContext } from "@/context/ProfileReportReasonsContext";
import toast from "@/utils/toast";

type Props = {
  ref: React.RefObject<RNBottomSheetModal | null>;
  profileId: number;
};

const ReportProfileModal = ({ ref, profileId }: Props) => {
  const { setLightOrDark, isDarkMode } = useColorMode();
  const { data: reportReasons } = useProfileReportReasonsContext();

  const reportDetailsInputRef = useRef<RNTextInput>(null);
  const reportDetailsValueRef = useRef("");

  const [reportLoading, setReportLoading] = useState(false);
  const [reportReasonId, setReportReasonId] = useState<number | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportDetailsLength, setReportDetailsLength] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleReportProfile = async () => {
    if (!reportReasonId) return;

    setReportLoading(true);
    setReportError(null);

    const { error, data } = await reportProfile(profileId, reportReasonId, reportDetailsValueRef.current);
    if (!error && data) {
      setTimeout(() => {
        ref.current?.dismiss();
        setReportLoading(false);
      }, 300);
      setTimeout(() => {
        resetReportState();
        toast.success("That profile has been reported. Thank you!", { visibilityTime: 7000 });
      }, 500);
    } else {
      setReportError("There was an error reporting that profile. Please try again.");
      setReportLoading(false);
    }
  };

  const handleReportReasonSelect = (reasonId: number) => {
    setReportReasonId(reasonId);

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
    setReportError(null);
    slideAnim.setValue(0);
  };

  const handleCancelReport = () => {
    ref.current?.dismiss();
    setTimeout(() => {
      resetReportState();
    }, 300);
  };

  return (
    <BottomSheetModal
      handleTitle="Report Profile"
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
              <Text style={s.reasonsPrimaryText}>Why would you like to report this profile?</Text>
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
              <Text style={s.detailsPrimaryText}>Why would you like to report this profile?</Text>
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
              {reportError ? <Text style={s.reportErrorText}>{reportError}</Text> : null}
              <View style={{ marginTop: 24 }}>
                <Button
                  text="Submit Report"
                  onPress={handleReportProfile}
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

export default ReportProfileModal;

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
