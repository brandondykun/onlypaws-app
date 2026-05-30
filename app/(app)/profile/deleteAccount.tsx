import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { requestAccountDeletion, logOut as logOutApi } from "@/api/auth";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import * as tokenService from "@/services/tokenService";
import Button from "@/shared/ui/Button/Button";
import Text from "@/shared/ui/Text/Text";
import toast from "@/utils/toast";

const DeleteAccountScreen = () => {
  const { logOut } = useAuthUserContext();
  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const bottomSheetRef = useRef<RNBottomSheetModal>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    bottomSheetRef.current?.close();
    setLoading(true);

    const { error } = await requestAccountDeletion();
    if (error) {
      toast.error("There was an error deleting your account. Please try again.", { visibilityTime: 5000 });
      setLoading(false);
      return;
    }

    // Log the user out after scheduling deletion
    const refreshToken = await tokenService.getRefreshToken();
    if (refreshToken) {
      await logOutApi(refreshToken);
    }
    await logOut();
    toast.success("Account scheduled for deletion. Log in within 7 days and choose Recover Account to restore it.", {
      visibilityTime: 6000,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <View style={s.iconContainer}>
          <Ionicons name="warning-outline" size={40} color={setLightOrDark(COLORS.red[600], COLORS.red[500])} />
        </View>

        <Text style={s.title}>Delete Your Account</Text>

        <View style={s.infoSection}>
          <Text style={s.infoText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            When you delete your account, we start a 7-day grace period. Your account and data stay on our servers until
            that period ends, so you can still change your mind.
          </Text>
          <Text style={s.infoText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            To cancel deletion and restore your account, log back in anytime within those 7 days and choose{" "}
            <Text style={s.emphasis} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              Recover Account
            </Text>
            .
          </Text>
          <Text style={s.infoText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            After 7 days, your account is permanently deleted. Your profiles, posts, comments, and other data will be
            removed and cannot be recovered.
          </Text>
        </View>
      </View>

      <View style={s.deleteButtonContainer}>
        <Button
          text="Delete Account"
          onPress={() => bottomSheetRef.current?.present()}
          buttonStyle={{ backgroundColor: setLightOrDark(COLORS.red[700], COLORS.red[600]) }}
          loading={loading}
        />
      </View>

      <BottomSheetModal ref={bottomSheetRef} handleTitle="Delete Account" snapPoints={[]} enableDynamicSizing={true}>
        <BottomSheetView style={[s.sheetContent, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.sheetTextContainer}>
            <Text style={s.sheetTitle}>Are you sure you want to delete your account?</Text>
            <Text style={s.sheetSubtitle} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              You will be logged out now. You have 7 days to log back in and restore your account. After 7 days, your
              account and all associated data are permanently deleted.
            </Text>
          </View>
          <View style={s.sheetButtons}>
            <View style={{ flex: 1 }}>
              <Button
                text="Delete Account"
                onPress={handleDeleteAccount}
                buttonStyle={{ backgroundColor: setLightOrDark(COLORS.red[700], COLORS.red[600]) }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                text="Cancel"
                variant="secondary"
                onPress={() => bottomSheetRef.current?.close()}
                buttonStyle={{ backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[600]) }}
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </ScrollView>
  );
};

export default DeleteAccountScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
    gap: 16,
    justifyContent: "space-between",
  },
  iconContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
    marginBottom: 36,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emphasis: {
    fontWeight: "600",
  },
  deleteButtonContainer: {
    marginTop: 12,
  },
  sheetContent: {
    padding: 16,
    gap: 12,
  },
  sheetTextContainer: {
    marginBottom: 36,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  sheetSubtitle: {
    fontSize: 16,
  },
  sheetButtons: {
    flexDirection: "row",
    gap: 12,
  },
});
