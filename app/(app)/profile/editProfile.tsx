import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { getPetTypeOptions, updateProfile } from "@/api/profile";
import Button from "@/components/Button/Button";
import DropdownSelect, { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import TextInput from "@/components/TextInput/TextInput";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { PetTypeWithTitle } from "@/types";

const EditProfileScreen = () => {
  const { authProfile, updateAuthProfile } = useAuthProfileContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [aboutText, setAboutText] = useState(authProfile.about ? authProfile.about : "");
  const [profileName, setProfileName] = useState(authProfile.name ? authProfile.name : "");
  const [breed, setBreed] = useState(authProfile.breed ? authProfile.breed : "");
  const [petType, setPetType] = useState<PetTypeWithTitle | null>(null);
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [petTypeOptions, setPetTypeOptions] = useState<DropdownSelectOption[] | null>(null);

  const fetchPetTypeOptions = useCallback(async () => {
    const { error, data } = await getPetTypeOptions();
    if (!error && data) {
      const formatted = data.map((item) => {
        return { ...item, title: item.name };
      });
      setPetTypeOptions(formatted);
      const selectedType = authProfile.pet_type?.id;
      if (selectedType) {
        const defaultSelected = formatted.find((item) => item.id === selectedType);
        if (defaultSelected) {
          setPetType(defaultSelected);
        }
      }
    }
    // TODO: handle error here
  }, [authProfile.pet_type?.id]);

  useEffect(() => {
    fetchPetTypeOptions();
  }, [fetchPetTypeOptions]);

  const handleProfileUpdate = async () => {
    if (aboutText && authProfile?.id) {
      setUpdateProfileLoading(true);
      const updatedData = {
        about: aboutText,
        name: profileName,
        breed,
        pet_type: petType ? petType.id : null,
      };
      const { error, data } = await updateProfile(updatedData, authProfile.id);
      if (!error && data) {
        setProfileName(data.name);
        setAboutText(data.about ? data.about : "");
        setBreed(data.breed ? data.breed : "");
        updateAuthProfile(data.name, data.about, data.breed, data.pet_type);
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your profile.",
        });
      }
      setUpdateProfileLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, paddingTop: 12, gap: 12 }}>
          <View>
            <TextInput
              label="Name"
              value={profileName}
              onChangeText={(val) => setProfileName(val)}
              placeholder="ex: Charlie"
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              label="Pet Type"
              defaultText="Select a pet type"
              defaultValue={petType ? petType : null}
              data={petTypeOptions || []}
              onSelect={(selectedItem) => setPetType(selectedItem)}
            />
          </View>
          <View>
            <TextInput
              label="Breed"
              value={breed}
              onChangeText={(val) => setBreed(val)}
              placeholder="ex: Golden Retriever"
            />
          </View>
          <View>
            <TextInput
              label="About"
              value={aboutText}
              onChangeText={(val) => setAboutText(val)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
              showCharCount
            />
          </View>
        </View>

        <View style={{ marginTop: 36 }}>
          <Button text="Submit" onPress={handleProfileUpdate} loading={updateProfileLoading} />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;

const s = StyleSheet.create({
  scrollView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
});
