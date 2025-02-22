import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { updateUsername as updateUsernameApi } from "@/api/profile";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";

const EditUsernameScreen = () => {
  const { authProfile, updateUsername } = useAuthProfileContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const { setLightOrDark } = useColorMode();

  const [username, setUsername] = useState(authProfile.username ? authProfile.username : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await updateUsernameApi(authProfile.id, username);
    if (!error && data) {
      updateUsername(username);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Username updated successfully.",
      });
      router.back();
    } else {
      setError(error);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            marginBottom: 24,
            padding: 12,
            borderRadius: 8,
            backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
            gap: 18,
          }}
        >
          <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 18, fontWeight: "300" }}>
            *Username must be unique among all profiles on OnlyPaws.
          </Text>
          <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 18, fontWeight: "300" }}>
            *This is the username visible to other users.
          </Text>
          <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 18, fontWeight: "300" }}>
            *Other users can search for your profile by this username.
          </Text>
        </View>
        <Text>Username</Text>
        <TextInput value={username} onChangeText={(val) => setUsername(val)} error={error} autoCapitalize="none" />
      </View>
      <View style={{ marginTop: 36 }}>
        <Button
          text="Save"
          onPress={handleUpdateUsername}
          loading={loading}
          disabled={authProfile.username === username || username.length === 0}
        />
      </View>
    </ScrollView>
  );
};

export default EditUsernameScreen;

const s = StyleSheet.create({
  scrollView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
});
