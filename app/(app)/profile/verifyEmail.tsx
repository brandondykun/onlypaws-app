import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { verifyEmailChange } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";

const VerifyEmailScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { newEmail } = useLocalSearchParams();
  const { changeEmail } = useAuthUserContext();

  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!verificationCode) {
      setError("Please enter the verification code.");
      return;
    }

    setSubmitLoading(true);
    const { error } = await verifyEmailChange(verificationCode);

    if (!error) {
      changeEmail(newEmail as string);
      router.back();
      router.back();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Email updated successfully!",
      });
    } else {
      if (error?.error?.token) {
        setError(error.error.token);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was en error verifying your email. Please try again.",
        });
      }
    }

    setSubmitLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ marginBottom: 32, marginTop: 12, flex: 1, gap: 24 }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "300" }} darkColor={COLORS.zinc[300]}>
            A verification email was sent to:
          </Text>
          <View style={{ flexDirection: "row", paddingVertical: 24 }}>
            <Text style={{ fontSize: 20 }}>{newEmail}</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
            Your email will not be updated until you confirm the verification code.
          </Text>
        </View>
        <TextInput
          label="Verification Code"
          value={verificationCode}
          onChangeText={setVerificationCode}
          style={{ marginBottom: 12 }}
          error={error}
          autoCapitalize="none"
        />
      </View>
      <Button text="Submit" onPress={handleSubmit} loading={submitLoading} disabled={!verificationCode} />
    </ScrollView>
  );
};

export default VerifyEmailScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
  },
});
