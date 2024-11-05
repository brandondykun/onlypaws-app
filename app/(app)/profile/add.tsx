import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

import { createProfile } from "@/api/profile";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const AddProfileScreen = () => {
  const { setActiveProfileId, addProfileOption } = useAuthUserContext();
  const isDarkMode = useColorMode();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleCreateProfile = async () => {
    // create new profile
    // select new profile
    // navigate back a screen and pop current screen from stack

    if (!username) {
      setUsernameError("Please enter a username.");
      return;
    }

    setSubmitLoading(true);
    const { error, data } = await createProfile(username, about, name);
    if (!error && data) {
      setActiveProfileId(data.id);
      addProfileOption({ id: data.id, username: data.username });
      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error creating your new profile.",
      });
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 24, paddingBottom: 48, gap: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "300" }} darkColor={COLORS.zinc[100]}>
            Awesome, having multiple pets is the best!
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
            You can create multiple profiles and manage them here, through the same OnlyPaws account.
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          <TextInput label="Username" value={username} onChangeText={setUsername} error={usernameError} />
          <TextInput label="Pet Name" value={name} onChangeText={setName} />
          <TextInput label="About" value={about} onChangeText={setAbout} multiline numberOfLines={5} />
        </View>
      </View>
      <Button
        text="Add New Profile"
        onPress={handleCreateProfile}
        loading={submitLoading}
        icon={<AntDesign name="pluscircle" size={18} color={isDarkMode ? COLORS.zinc[900] : COLORS.zinc[100]} />}
      />
    </ScrollView>
  );
};

export default AddProfileScreen;
