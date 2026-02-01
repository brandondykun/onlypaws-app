import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native";

import { updateUsername as updateUsernameApi } from "@/api/profile";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import toast from "@/utils/toast";
import { verifyUsername } from "@/utils/utils";

const EditUsernameScreen = () => {
  const { authProfile, updateUsername } = useAuthProfileContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const { setLightOrDark } = useColorMode();

  const [username, setUsername] = useState(authProfile.username ? authProfile.username : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async () => {
    setError("");

    let hasErrors = false;

    const usernameError = verifyUsername(username);

    if (usernameError) {
      setError(usernameError);
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);

    const { data, error } = await updateUsernameApi(authProfile.id, username);
    if (!error && data) {
      updateUsername(username);
      toast.success("Username updated successfully.");
      router.back();
    } else {
      setError(error);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ flex: 1 }}>
        <TextInput
          value={username}
          onChangeText={(val) => setUsername(val)}
          error={error}
          autoCapitalize="none"
          label="Username"
          autoCorrect={false}
          autoComplete="off"
        />
        <View style={{ gap: 16, marginTop: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ marginTop: 6, width: 25, alignItems: "center" }}>
              <FontAwesome5 name="check-circle" size={21} color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />
            </View>
            <View style={{ flex: 1 }}>
              <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, fontWeight: "300", lineHeight: 24 }}>
                Username must be unique among all profiles on OnlyPaws.
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ marginTop: 4, width: 25, alignItems: "center" }}>
              <Feather name="eye" size={23} color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />
            </View>
            <View style={{ flex: 1 }}>
              <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, fontWeight: "300", lineHeight: 24 }}>
                This is the username visible to other users.
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ marginTop: 5, width: 25, alignItems: "center" }}>
              <Ionicons name="search-sharp" size={23} color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />
            </View>
            <View style={{ flex: 1 }}>
              <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, fontWeight: "300", lineHeight: 24 }}>
                Other users can search for your profile by this username.
              </Text>
            </View>
          </View>
        </View>
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
