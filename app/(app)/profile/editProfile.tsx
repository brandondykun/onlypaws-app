import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import { ScrollView } from "react-native";

import { updateProfile } from "@/api/profile";
import DatePicker from "@/components/DatePicker/DatePicker";
import DropdownSelect, { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import PrivateProfileModal from "@/components/PrivateProfileModal/PrivateProfileModal";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePetTypeOptions } from "@/hooks/usePetTypeOptions";
import Button from "@/shared/ui/Button/Button";
import { PetLevel, PetSex, PetTypeWithTitle } from "@/types";
import toast from "@/utils/toast";

const SEX_OPTIONS: DropdownSelectOption[] = [
  { id: 1, title: "Male" },
  { id: 2, title: "Female" },
];

const LEVEL_OPTIONS: DropdownSelectOption[] = [
  { id: 1, title: "Low" },
  { id: 2, title: "Medium" },
  { id: 3, title: "High" },
];

const YES_NO_OPTIONS: DropdownSelectOption[] = [
  { id: 1, title: "Yes" },
  { id: 2, title: "No" },
];

const boolToOption = (val: boolean | null): DropdownSelectOption | null => {
  if (val === true) return YES_NO_OPTIONS[0];
  if (val === false) return YES_NO_OPTIONS[1];
  return null;
};

const optionToBool = (option: DropdownSelectOption | null): boolean | null => {
  if (!option) return null;
  if (option.id === 1) return true;
  if (option.id === 2) return false;
  return null;
};

const sexToOption = (sex: PetSex): DropdownSelectOption | null => {
  if (sex === "Male") return SEX_OPTIONS[0];
  if (sex === "Female") return SEX_OPTIONS[1];
  return null;
};

const optionToSex = (option: DropdownSelectOption | null): string => {
  if (!option) return "";
  if (option.id === 1) return "MALE";
  if (option.id === 2) return "FEMALE";
  return "";
};

const levelToOption = (level: PetLevel): DropdownSelectOption | null => {
  if (level === "Low") return LEVEL_OPTIONS[0];
  if (level === "Medium") return LEVEL_OPTIONS[1];
  if (level === "High") return LEVEL_OPTIONS[2];
  return null;
};

const optionToLevel = (option: DropdownSelectOption | null): string => {
  if (!option) return "";
  if (option.id === 1) return "LOW";
  if (option.id === 2) return "MEDIUM";
  if (option.id === 3) return "HIGH";
  return "";
};

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  // New pet attribute fields
  const [sex, setSex] = useState<DropdownSelectOption | null>(sexToOption(authProfile.sex));
  const [birthdate, setBirthdate] = useState<string | null>(authProfile.birthdate ?? null);
  const [weight, setWeight] = useState(authProfile.weight != null ? String(authProfile.weight) : "");
  const [isSpayedNeutered, setIsSpayedNeutered] = useState<DropdownSelectOption | null>(
    boolToOption(authProfile.is_spayed_neutered ?? null),
  );
  const [isServiceAnimal, setIsServiceAnimal] = useState<DropdownSelectOption | null>(
    boolToOption(authProfile.is_service_animal ?? null),
  );
  const [energyLevel, setEnergyLevel] = useState<DropdownSelectOption | null>(levelToOption(authProfile.energy_level));
  const [anxietyLevel, setAnxietyLevel] = useState<DropdownSelectOption | null>(
    levelToOption(authProfile.anxiety_level),
  );

  const { data: petTypeOptions } = usePetTypeOptions();

  const handleProfileUpdate = useCallback(async () => {
    if (authProfile?.public_id) {
      setUpdateProfileLoading(true);
      setFieldErrors({});
      const parsedWeight = weight !== "" ? parseInt(weight, 10) : null;
      const updatedData = {
        about: aboutText,
        name: profileName,
        breed,
        pet_type: petType ? petType.id : null,
        is_private: isPrivate,
        sex: optionToSex(sex),
        birthdate,
        weight: parsedWeight,
        is_spayed_neutered: optionToBool(isSpayedNeutered),
        is_service_animal: optionToBool(isServiceAnimal),
        energy_level: optionToLevel(energyLevel),
        anxiety_level: optionToLevel(anxietyLevel),
      };
      const { error, data, fieldErrors: errors } = await updateProfile(updatedData, authProfile.public_id);
      if (!error && data) {
        updateAuthProfile({
          name: data.name,
          about: data.about,
          breed: data.breed,
          pet_type: data.pet_type,
          is_private: data.is_private,
          sex: data.sex,
          birthdate: data.birthdate,
          weight: data.weight,
          is_spayed_neutered: data.is_spayed_neutered,
          is_service_animal: data.is_service_animal,
          energy_level: data.energy_level,
          anxiety_level: data.anxiety_level,
        });
        router.back();
      } else if (errors) {
        setFieldErrors(errors);
      } else {
        toast.error("There was an error updating your profile.");
      }
      setUpdateProfileLoading(false);
    }
  }, [
    authProfile?.public_id,
    aboutText,
    profileName,
    breed,
    petType,
    updateAuthProfile,
    router,
    isPrivate,
    sex,
    birthdate,
    weight,
    isSpayedNeutered,
    isServiceAnimal,
    energyLevel,
    anxietyLevel,
  ]);

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
              onChangeText={(val) => {
                setProfileName(val);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="ex: Charlie"
              error={fieldErrors.name}
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
              onChangeText={(val) => {
                setBreed(val);
                if (fieldErrors.breed) setFieldErrors((prev) => ({ ...prev, breed: undefined }));
              }}
              placeholder="ex: Golden Retriever"
              error={fieldErrors.breed}
            />
          </View>
          <View>
            <TextInput
              label="About"
              value={aboutText}
              onChangeText={(val) => {
                setAboutText(val);
                if (fieldErrors.about) setFieldErrors((prev) => ({ ...prev, about: undefined }));
              }}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
              showCharCount
              error={fieldErrors.about}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              label="Sex"
              defaultText="Select sex"
              defaultValue={sex}
              data={SEX_OPTIONS}
              onSelect={(selectedItem) => setSex(selectedItem)}
              onClear={() => setSex(null)}
            />
            {fieldErrors.sex ? <Text style={s.errorText}>{fieldErrors.sex}</Text> : null}
          </View>

          <DatePicker
            label="Birthdate"
            sheetTitle="Birthdate"
            value={birthdate}
            onChange={(dateStr) => {
              setBirthdate(dateStr);
              if (fieldErrors.birthdate) setFieldErrors((prev) => ({ ...prev, birthdate: undefined }));
            }}
            onClear={() => setBirthdate(null)}
            error={fieldErrors.birthdate}
          />

          <View>
            <TextInput
              label="Weight (lbs)"
              value={weight}
              onChangeText={(val) => {
                const numeric = val.replace(/[^0-9]/g, "");
                setWeight(numeric);
                if (fieldErrors.weight) setFieldErrors((prev) => ({ ...prev, weight: undefined }));
              }}
              placeholder="ex: 50"
              keyboardType="number-pad"
              error={fieldErrors.weight}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              label="Energy Level"
              defaultText="Select energy level"
              defaultValue={energyLevel}
              data={LEVEL_OPTIONS}
              onSelect={(selectedItem) => setEnergyLevel(selectedItem)}
              onClear={() => setEnergyLevel(null)}
            />
            {fieldErrors.energy_level ? <Text style={s.errorText}>{fieldErrors.energy_level}</Text> : null}
          </View>

          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              label="Anxiety Level"
              defaultText="Select anxiety level"
              defaultValue={anxietyLevel}
              data={LEVEL_OPTIONS}
              onSelect={(selectedItem) => setAnxietyLevel(selectedItem)}
              onClear={() => setAnxietyLevel(null)}
            />
            {fieldErrors.anxiety_level ? <Text style={s.errorText}>{fieldErrors.anxiety_level}</Text> : null}
          </View>

          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              label="Spayed / Neutered"
              defaultText="Select yes or no"
              defaultValue={isSpayedNeutered}
              data={YES_NO_OPTIONS}
              onSelect={(selectedItem) => setIsSpayedNeutered(selectedItem)}
              onClear={() => setIsSpayedNeutered(null)}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <DropdownSelect
              label="Service Animal"
              defaultText="Select yes or no"
              defaultValue={isServiceAnimal}
              data={YES_NO_OPTIONS}
              onSelect={(selectedItem) => setIsServiceAnimal(selectedItem)}
              onClear={() => setIsServiceAnimal(null)}
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
              <Switch value={isPrivate} onValueChange={(val) => setIsPrivate(val)} testID="private-profile-switch" />
            </View>
          </View>
        </View>
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
  errorText: {
    color: COLORS.red[500],
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
});
