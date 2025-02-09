import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import { View, ScrollView, Pressable, StyleSheet, TextStyle } from "react-native";
import Toast from "react-native-toast-message";
import { PhotoFile } from "react-native-vision-camera";

import { addProfileImage, editProfileImage, updateProfile, getPetTypeOptions } from "@/api/profile";
import CameraModal from "@/components/CameraModal/CameraModal";
import ChangeProfileModal from "@/components/ChangeProfileModal/ChangeProfileModal";
import { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import ProfileOptionsModal from "@/components/ProfileOptionsModal/ProfileOptionsModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PetTypeWithTitle } from "@/types";
import { getImageUri } from "@/utils/utils";

const ProfileScreen = () => {
  const { user } = useAuthUserContext();
  const { updateProfileImage, authProfile, updateAuthProfile } = useAuthProfileContext();

  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const profileOptionsModalRef = useRef<RNBottomSheetModal>(null);
  const changeProfileModalRef = useRef<RNBottomSheetModal>(null);
  const editProfileModalRef = useRef<RNBottomSheetModal>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<(PhotoFile | ImagePickerAsset)[]>([]);

  const [aboutText, setAboutText] = useState(authProfile.about ? authProfile.about : "");
  const [profileName, setProfileName] = useState(authProfile.name ? authProfile.name : "");
  const [breed, setBreed] = useState(authProfile.breed ? authProfile.breed : "");
  const [petType, setPetType] = useState<PetTypeWithTitle | null>(null);

  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [petTypeOptions, setPetTypeOptions] = useState<DropdownSelectOption[] | null>(null);

  const navigation = useNavigation();
  const router = useRouter();

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

  useEffect(() => {
    if (authProfile) {
      // if auth profile changes, update text that shows in the edit modals
      setAboutText(authProfile.about ? authProfile.about : "");
      setProfileName(authProfile.name ? authProfile.name : "");
      setBreed(authProfile.breed ? authProfile.breed : "");
      if (authProfile.pet_type) {
        setPetType({ ...authProfile.pet_type, title: authProfile.pet_type.name });
      } else {
        setPetType(null);
      }
    }
  }, [authProfile]);

  const handleEditModalClose = () => {
    setAboutText(authProfile.about ? authProfile.about : "");
    setProfileName(authProfile.name ? authProfile.name : "");
    setBreed(authProfile.breed ? authProfile.breed : "");
    if (authProfile.pet_type) {
      setPetType({ ...authProfile.pet_type, title: authProfile.pet_type.name });
    } else {
      setPetType(null);
    }
  };

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => profileOptionsModalRef.current?.present()}
          style={({ pressed }) => [pressed && { opacity: 0.7 }, { paddingLeft: 24, paddingVertical: 8 }]}
          hitSlop={20}
          testID="view-profile-options-button"
        >
          <SimpleLineIcons name="options" size={18} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
        </Pressable>
      ),
    });
  });

  const handleSavePress = async () => {
    const formData = new FormData();
    formData.append("profileId", authProfile.id.toString());

    formData.append("image", {
      uri: getImageUri(image[0]),
      name: `profile_image.jpeg`,
      type: "image/jpeg",
      mimeType: "multipart/form-data",
    } as any);

    const accessToken = await SecureStore.getItemAsync("ACCESS_TOKEN");
    if (accessToken) {
      setUpdateProfileLoading(true);
      if (authProfile.image) {
        // edit profile image
        const { error, data } = await editProfileImage(authProfile.image.id, formData, accessToken);
        if (!error && data) {
          setImage([]);
          setShowCamera(false);
          updateProfileImage(data);
          // updateProfileDetailsImage(data);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "There was an error updating your profile picture.",
          });
        }
      } else {
        // create new profile image
        const { error, data } = await addProfileImage(formData, accessToken);
        if (!error && data) {
          setImage([]);
          setShowCamera(false);
          updateProfileImage(data);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "There was an error updating your profile picture.",
          });
        }
      }
      setUpdateProfileLoading(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error updating your profile picture.",
      });
    }
  };

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
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your about text",
        });
      }
      setUpdateProfileLoading(false);
      editProfileModalRef.current?.close();
    }
  };

  const handleAddProfilePress = () => {
    changeProfileModalRef?.current?.close();
    router.push("/(app)/profile/add");
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: tabBarHeight + 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={{ marginBottom: 48, alignItems: "center" }}>
            <ProfileDetailsHeaderImage image={authProfile.image} size={150} />
          </View>
          <Text darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[600]} style={s.sectionHeader}>
            ACCOUNT DETAILS
          </Text>
          <View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[125], COLORS.zinc[925]) }]}>
            <LabelAndText label="EMAIL" text={user.email} />
            <LabelAndText label="USERNAME" text={authProfile.username} />
          </View>
          <Text darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[600]} style={s.sectionHeader}>
            PROFILE DETAILS
          </Text>
          <View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[125], COLORS.zinc[925]) }]}>
            <LabelAndText label="NAME" text={authProfile.name} placeholder="No name entered" />
            <LabelAndText label="PET TYPE" text={authProfile.pet_type?.name} placeholder="No pet type selected" />
            <LabelAndText label="BREED" text={authProfile.breed} placeholder="No breed entered" />
            <LabelAndText label="ABOUT" text={authProfile.about} placeholder="No about text" />
          </View>
        </View>
      </ScrollView>
      <CameraModal
        visible={showCamera}
        setVisible={setShowCamera}
        images={image}
        setImages={setImage}
        maxImages={1}
        onSavePress={handleSavePress}
        loading={updateProfileLoading}
      />
      <EditProfileModal
        petTypeOptions={petTypeOptions}
        profileName={profileName}
        setProfileName={setProfileName}
        handleEditModalClose={handleEditModalClose}
        petType={petType}
        setPetType={setPetType}
        aboutText={aboutText}
        setAboutText={setAboutText}
        breed={breed}
        setBreed={setBreed}
        editProfileModalRef={editProfileModalRef}
        handleProfileUpdate={handleProfileUpdate}
        updateProfileLoading={updateProfileLoading}
      />
      <ProfileOptionsModal
        setShowCamera={setShowCamera}
        profileOptionsModalRef={profileOptionsModalRef}
        editProfileModalRef={editProfileModalRef}
        changeProfileModalRef={changeProfileModalRef}
      />
      <ChangeProfileModal ref={changeProfileModalRef} onAddProfilePress={handleAddProfilePress} />
    </>
  );
};

export default ProfileScreen;

type LabelAndTextProps = {
  label: string;
  text: string | undefined | null;
  placeholder?: string;
};

const LabelAndText = ({ label, text, placeholder = "" }: LabelAndTextProps) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View style={{ padding: 12 }}>
      <Text style={s.label}>{label}</Text>
      <Text
        style={{
          fontSize: text ? 20 : 18,
          color: text ? setLightOrDark(COLORS.zinc[900], COLORS.zinc[100]) : COLORS.zinc[500],
          fontStyle: text ? "normal" : "italic",
          fontWeight: text ? (setLightOrDark("400", "300") as TextStyle["fontWeight"]) : "300",
        }}
      >
        {text ? text : placeholder}
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.zinc[500],
    letterSpacing: 0.5,
    paddingBottom: 4,
  },
  sectionHeader: {
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 8,
    fontWeight: "500",
  },
  card: {
    borderRadius: 8,
    marginBottom: 48,
    padding: 6,
  },
});
