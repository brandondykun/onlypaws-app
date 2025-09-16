import AntDesign from "@expo/vector-icons/AntDesign";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

import { createProfile, getPetTypeOptions } from "@/api/profile";
import Button from "@/components/Button/Button";
import { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import DropdownSelect from "@/components/DropdownSelect/DropdownSelect";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const AddProfileScreen = () => {
  const { setActiveProfileId, addProfileOption } = useAuthUserContext();
  const { isDarkMode } = useColorMode();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [breed, setBreed] = useState("");
  const [petType, setPetType] = useState<DropdownSelectOption | null>(null);
  const [petTypeOptions, setPetTypeOptions] = useState<DropdownSelectOption[] | null>(null);

  const fetchPetTypeOptions = useCallback(async () => {
    const { error, data } = await getPetTypeOptions();
    if (!error && data) {
      const formatted = data.map((item) => {
        return { ...item, title: item.name };
      });
      setPetTypeOptions(formatted);
    }
    // TODO: handle error here
  }, []);

  useEffect(() => {
    if (!petTypeOptions) {
      fetchPetTypeOptions();
    }
  }, [fetchPetTypeOptions, petTypeOptions]);

  const handleCreateProfile = async () => {
    setUsernameError("");

    if (!username) {
      setUsernameError("Please enter a username.");
      return;
    }

    setSubmitLoading(true);
    const { error, data } = await createProfile(username, about, name, breed, petType?.id);

    if (!error && data) {
      setActiveProfileId(data.id);
      addProfileOption({ id: data.id, username: data.username, image: null, name: "" });
      router.back();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `New profile created! You are now using your new profile ${username}.`,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error creating your new profile.",
      });
      if (error?.username) {
        setUsernameError(error.username[0]);
      }
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: tabBarHeight + 36 }}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, marginBottom: 36 }}>
        <View style={{ paddingTop: 24, paddingBottom: 36, gap: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "300" }} darkColor={COLORS.zinc[100]}>
            Awesome, having multiple pets is the best!
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
            You can create multiple profiles and manage them here, through the same OnlyPaws account.
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            error={usernameError}
            autoCapitalize="none"
          />
          <TextInput label="Pet Name" value={name} onChangeText={setName} />
          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              defaultText="Select a pet type"
              data={petTypeOptions || []}
              onSelect={(selectedItem) => setPetType(selectedItem)}
              label="Pet Type"
              dropdownStyle={{
                borderRadius: 8,
                backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                height: 300,
              }}
            />
          </View>
          <TextInput label="Breed" value={breed} onChangeText={setBreed} />
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
