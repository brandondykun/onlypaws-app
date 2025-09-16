import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { requestEmailChange } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";

const ChangeEmailScreen = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    setNewEmailError("");

    if (!newEmail) {
      setNewEmailError("Please enter a new email.");
      return;
    }

    setSubmitLoading(true);

    const { error } = await requestEmailChange(newEmail);
    if (!error) {
      router.push({
        pathname: "/profile/verifyEmail",
        params: {
          newEmail,
        },
      });
    } else {
      if (error?.error?.email) {
        if (error?.error?.email) {
          setNewEmailError(error.error.email);
        } else if (error?.error?.other) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.error.other,
          });
        }
      }
    }

    setSubmitLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 24 }]}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 32, marginTop: 12, flex: 1, gap: 24 }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "400", marginBottom: 24 }}>Please enter your new email.</Text>
          <TextInput
            label="New Email"
            value={newEmail}
            onChangeText={setNewEmail}
            style={{ marginBottom: 12 }}
            error={newEmailError}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Text style={{ fontSize: 18, fontWeight: "300", marginVertical: 12 }} darkColor={COLORS.zinc[400]}>
            A verification code will be sent to your new email.
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
            Your email will not be updated until you confirm the verification code.
          </Text>
        </View>
      </View>
      <Button text="Submit" onPress={handleSubmit} loading={submitLoading} disabled={!newEmail} />
    </ScrollView>
  );
};

export default ChangeEmailScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
  },
});
