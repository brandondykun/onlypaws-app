import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Modal from "@/components/Modal/Modal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import Button from "@/shared/ui/Button/Button";

type TermsAgreementProps = {
  termsContent: string;
  onAccept: () => Promise<void>;
  loading: boolean;
  buttonText?: string;
};

const TermsAgreement = ({ termsContent, onAccept, loading, buttonText = "Continue" }: TermsAgreementProps) => {
  const { isDarkMode, setLightOrDark } = useColorMode();
  const [agreed, setAgreed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const markdownStyles = {
    body: {
      color: isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900],
      fontSize: 16,
      lineHeight: 22,
    },
    heading1: {
      color: isDarkMode ? COLORS.zinc[50] : COLORS.zinc[950],
      fontSize: 22,
      fontWeight: "700" as const,
      marginBottom: 8,
    },
    heading2: {
      color: isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900],
      fontSize: 20,
      fontWeight: "600" as const,
      marginBottom: 6,
      marginTop: 32,
    },
    heading3: {
      color: isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900],
      fontSize: 16,
      fontWeight: "600" as const,
      marginBottom: 4,
    },
    link: {
      color: isDarkMode ? COLORS.sky[400] : COLORS.sky[600],
    },
    bullet_list: {
      marginBottom: 8,
    },
  };

  return (
    <View style={s.container}>
      <View>
        <Pressable style={s.checkboxRow} onPress={() => setAgreed(!agreed)}>
          <View
            style={[
              s.checkbox,
              {
                borderColor: agreed
                  ? setLightOrDark(COLORS.sky[600], COLORS.sky[500])
                  : setLightOrDark(COLORS.zinc[400], COLORS.zinc[600]),
                backgroundColor: agreed ? setLightOrDark(COLORS.sky[600], COLORS.sky[500]) : "transparent",
              },
            ]}
          >
            {agreed && <Ionicons name="checkmark" size={16} color={COLORS.zinc[50]} />}
          </View>
          <Text style={s.checkboxLabel} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]}>
            I agree to the Terms of Service
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 32 }}>
          <Button text="View Full Terms" variant="text" onPress={() => setModalVisible(true)} />
        </View>
      </View>
      <Button text={buttonText} onPress={onAccept} loading={loading} disabled={!agreed} />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        backgroundColor={isDarkMode ? COLORS.zinc[950] : COLORS.zinc[100]}
        withScroll={false}
      >
        <View
          style={[
            s.modalHeader,
            { paddingTop: insets.top + 16, borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[900]) },
          ]}
        >
          <Text style={s.modalTitle} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
            Terms of Service
          </Text>
          <Pressable onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={28} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]} />
          </Pressable>
        </View>
        <ScrollView style={s.modalContent}>
          <Markdown style={markdownStyles}>{termsContent}</Markdown>
          <View style={{ height: insets.bottom + 32 }} />
        </ScrollView>
      </Modal>
    </View>
  );
};

export default TermsAgreement;

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    marginBottom: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: 18,
    fontWeight: "400",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
