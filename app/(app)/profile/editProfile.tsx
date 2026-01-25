import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import { ScrollView } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { updateProfile } from "@/api/profile";
import Button from "@/components/Button/Button";
import DropdownSelect from "@/components/DropdownSelect/DropdownSelect";
import PrivateProfileModal from "@/components/PrivateProfileModal/PrivateProfileModal";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePetTypeOptions } from "@/hooks/usePetTypeOptions";
import { PetTypeWithTitle } from "@/types";

const EditProfileScreen = () => {
  const { authProfile, updateAuthProfile } = useAuthProfileContext();
  const { setLightOrDark } = useColorMode();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const privateProfileModalRef = useRef<BottomSheetModal>(null);

  const [aboutText, setAboutText] = useState(authProfile.about ? authProfile.about : "");
  const [profileName, setProfileName] = useState(authProfile.name ? authProfile.name : "");
  const [breed, setBreed] = useState(authProfile.breed ? authProfile.breed : "");
  const [petType, setPetType] = useState<PetTypeWithTitle | null>(null);
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(authProfile.is_private ? authProfile.is_private : false);

  const { data: petTypeOptions } = usePetTypeOptions();

  const handleProfileUpdate = useCallback(async () => {
    if (authProfile?.id) {
      setUpdateProfileLoading(true);
      const updatedData = {
        about: aboutText,
        name: profileName,
        breed,
        pet_type: petType ? petType.id : null,
        is_private: isPrivate,
      };
      const { error, data } = await updateProfile(updatedData, authProfile.id);
      if (!error && data) {
        updateAuthProfile(data.name, data.about, data.breed, data.pet_type, data.is_private);
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
  }, [authProfile?.id, aboutText, profileName, breed, petType, updateAuthProfile, router, isPrivate]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          text="Cancel"
          variant="text"
          onPress={() => {
            if (router.canGoBack()) {
              router.replace("/(app)/profile");
              router.back();
            } else {
              router.replace("/(app)/profile");
            }
          }}
          buttonStyle={{ paddingHorizontal: 8, paddingBottom: 4 }}
        />
      ),
      headerRight: () => (
        <Button
          text="Save"
          variant="text"
          onPress={handleProfileUpdate}
          buttonStyle={{ paddingHorizontal: 10, paddingBottom: 4 }}
          textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]), fontWeight: "500" }}
          disabled={updateProfileLoading}
          loading={updateProfileLoading}
        />
      ),
    });
  }, [navigation, router, updateProfileLoading, setLightOrDark, handleProfileUpdate]);

  // Set default pet type when options are loaded
  useEffect(() => {
    if (petTypeOptions && authProfile.pet_type?.id && !petType) {
      const defaultSelected = petTypeOptions.find((item) => item.id === authProfile.pet_type?.id);
      if (defaultSelected) {
        setPetType(defaultSelected);
      }
    }
  }, [petTypeOptions, authProfile.pet_type?.id, petType]);

  return (
    <ScrollView
      contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
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

          <View style={{ paddingVertical: 24 }}>
            <Text
              style={[
                s.label,
                {
                  color: setLightOrDark(COLORS.zinc[600], COLORS.zinc[400]),
                },
              ]}
            >
              Private Profile
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 24,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, marginBottom: 4 }}>Make your profile private</Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "400", wordWrap: "wrap" }}
                  darkColor={COLORS.zinc[400]}
                  lightColor={COLORS.zinc[600]}
                >
                  Check this if you want to set your profile to private.{" "}
                  <Button
                    buttonStyle={s.learnMoreButton}
                    textStyle={[s.learnMoreButtonText, { color: setLightOrDark(COLORS.sky[600], COLORS.sky[400]) }]}
                    variant="text"
                    text="Learn More"
                    onPress={() => privateProfileModalRef.current?.present()}
                    hitSlop={10}
                  />
                </Text>
              </View>
              <Switch value={isPrivate} onValueChange={(val) => setIsPrivate(val)} />
            </View>
          </View>
        </View>

        {/* <View style={{ marginTop: 36 }}>
          <Button text="Submit" onPress={handleProfileUpdate} loading={updateProfileLoading} />
        </View> */}
      </View>
      <PrivateProfileModal ref={privateProfileModalRef} />
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
  label: {
    width: "auto",
    zIndex: 2,
    fontSize: 13,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  learnMoreButton: {
    padding: 0,
    margin: 0,
    paddingTop: 0,
    height: "auto",
    marginBottom: -4,
  },
  learnMoreButtonText: {
    fontSize: 14,
    fontWeight: "400",
    textDecorationLine: "none",
  },
});
