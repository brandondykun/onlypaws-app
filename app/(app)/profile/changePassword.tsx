import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { changePassword } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const ChangePasswordScreen = () => {
  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();

  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmNewPasswordError("");

    let hasErrors = false;

    if (newPassword !== confirmNewPassword) {
      setNewPasswordError("Passwords do not match.");
      setConfirmNewPasswordError("Passwords do not match.");
      hasErrors = true;
    }

    if (currentPassword.length === 0) {
      setCurrentPasswordError("Current password is required.");
      hasErrors = true;
    }

    if (hasErrors) return;

    setSubmitLoading(true);
    const res = await changePassword(currentPassword, newPassword);

    if (res.status === 400 && res.error) {
      if (res.error.old_password) {
        setCurrentPasswordError(res.error.old_password[0]);
      } else if (res.error.new_password) {
        setNewPasswordError(res.error.new_password[0]);
      }
    } else if (res.status === 500) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while changing your password. Please try again.",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your password has been updated.",
      });
      router.back();
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ marginBottom: 32, marginTop: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "300" }}>
          Please enter your current password, and your new password twice to confirm.
        </Text>
      </View>
      <View style={{ gap: 12, flex: 1 }}>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
          autoComplete="off"
          secureTextEntry
          error={currentPasswordError}
        />
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
          autoComplete="off"
          secureTextEntry
          error={newPasswordError}
        />
        <TextInput
          label="Confirm New Password"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          autoCapitalize="none"
          autoComplete="off"
          secureTextEntry
          error={confirmNewPasswordError}
        />
        <View
          style={{
            gap: 4,
            padding: 16,
            backgroundColor: setLightOrDark(COLORS.zinc[125], COLORS.zinc[900]),
            borderRadius: 12,
            marginTop: 8,
          }}
        >
          <Text
            style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}
            darkColor={COLORS.zinc[400]}
            lightColor={COLORS.zinc[700]}
          >
            New Password:
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "300" }}>- Cannot be entirely numeric.</Text>
          <Text style={{ fontSize: 16, fontWeight: "300" }}>- Cannot be the same as your old password.</Text>
          <Text style={{ fontSize: 16, fontWeight: "300" }}>- Must be at least 9 characters long.</Text>
          <Text style={{ fontSize: 16, fontWeight: "300" }}>- Cannot be a commonly used password.</Text>
        </View>
      </View>
      <View>
        <Button text="Change Password" onPress={handleSubmit} loading={submitLoading} />
      </View>
    </ScrollView>
  );
};

export default ChangePasswordScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
  },
});
