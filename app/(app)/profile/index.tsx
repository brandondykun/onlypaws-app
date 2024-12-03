import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetScrollView, BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { PhotoFile } from "react-native-vision-camera";

import { addProfileImage, editProfileImage, updateProfile, getPetTypeOptions } from "@/api/profile";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import CameraModal from "@/components/CameraModal/CameraModal";
import ChangeProfileModal from "@/components/ChangeProfileModal/ChangeProfileModal";
import DropdownSelect, { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

const ProfileScreen = () => {
  const { user, logOut } = useAuthUserContext();
  const { updateProfileImage, authProfile, updateAuthProfile } = useAuthProfileContext();

  const { isDarkMode } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const profileOptionsModalRef = useRef<RNBottomSheetModal>(null);
  const changeProfileModalRef = useRef<RNBottomSheetModal>(null);
  const editProfileModalRef = useRef<RNBottomSheetModal>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<(PhotoFile | ImagePickerAsset)[]>([]);

  const [aboutText, setAboutText] = useState(authProfile.about ? authProfile.about : "");
  const [profileName, setProfileName] = useState(authProfile.name ? authProfile.name : "");
  const [breed, setBreed] = useState(authProfile.breed ? authProfile.breed : "");
  const [petType, setPetType] = useState<{ id: number; title: string; name: string } | null>(null);

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
        >
          <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
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
          <View style={{ marginBottom: 28, alignItems: "center" }}>
            <ProfileDetailsHeaderImage image={authProfile.image} size={150} />
          </View>
          <View
            style={{
              backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200],
              borderRadius: 8,
              marginBottom: 24,
              padding: 6,
            }}
          >
            <View style={{ padding: 16 }}>
              <Text style={s.label}>EMAIL</Text>
              <Text style={{ fontSize: 20 }}>{user.email}</Text>
            </View>
          </View>
          <View
            style={{ backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200], borderRadius: 8, padding: 6 }}
          >
            <View style={{ padding: 16, marginBottom: 8 }}>
              <Text style={s.label}>USERNAME</Text>
              <Text style={{ fontSize: 20 }}>{authProfile.username}</Text>
            </View>
            <View style={{ padding: 16, marginBottom: 8 }}>
              <Text style={s.label}>NAME</Text>
              <Text
                style={{
                  fontSize: authProfile.name ? 20 : 18,
                  color: authProfile.name ? (isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900]) : COLORS.zinc[500],
                  fontStyle: authProfile.name ? "normal" : "italic",
                  fontWeight: authProfile.name ? "normal" : "300",
                }}
              >
                {authProfile.name ? authProfile.name : "No name entered"}
              </Text>
            </View>

            <View style={{ padding: 16, marginBottom: 8 }}>
              <Text style={s.label}>PET TYPE</Text>
              <Text
                style={{
                  fontSize: authProfile.pet_type ? 20 : 18,
                  color: authProfile.pet_type ? (isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900]) : COLORS.zinc[500],
                  fontStyle: authProfile.pet_type ? "normal" : "italic",
                  fontWeight: authProfile.pet_type ? "normal" : "300",
                }}
              >
                {authProfile.pet_type ? authProfile.pet_type.name : "No pet type selected"}
              </Text>
            </View>

            <View style={{ padding: 16, marginBottom: 8 }}>
              <Text style={s.label}>BREED</Text>
              <Text
                style={{
                  fontSize: authProfile.breed ? 20 : 18,
                  color: authProfile.breed ? (isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900]) : COLORS.zinc[500],
                  fontStyle: authProfile.breed ? "normal" : "italic",
                  fontWeight: authProfile.breed ? "normal" : "300",
                }}
              >
                {authProfile.breed ? authProfile.breed : "No breed entered"}
              </Text>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={s.label}>ABOUT</Text>
              {authProfile.about ? (
                <Text style={{ fontSize: 20 }}>{authProfile.about}</Text>
              ) : (
                <Text
                  darkColor={COLORS.zinc[600]}
                  lightColor={COLORS.zinc[400]}
                  style={{ fontSize: 16, fontStyle: "italic", paddingTop: 4 }}
                >
                  No About Text
                </Text>
              )}
            </View>
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
      />
      <BottomSheetModal handleTitle="Edit Profile" ref={editProfileModalRef} onDismiss={handleEditModalClose}>
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 48, paddingTop: 16, paddingHorizontal: 24 }}>
          <View>
            <Text>Name</Text>
            <TextInput value={profileName} onChangeText={(val) => setProfileName(val)} placeholder="ex: Charlie" />
          </View>
          <View>
            <Text>About</Text>
            <TextInput
              value={aboutText}
              onChangeText={(val) => setAboutText(val)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
          <View>
            <Text>Breed</Text>
            <TextInput value={breed} onChangeText={(val) => setBreed(val)} placeholder="ex: Golden Retriever" />
          </View>
          <View>
            <Text>Pet Type</Text>
            <DropdownSelect
              defaultText="Select a pet type"
              defaultValue={petType ? petType : null}
              data={petTypeOptions || []}
              onSelect={(selectedItem) => setPetType(selectedItem)}
            />
          </View>
          <View style={{ marginTop: 36 }}>
            <Button text="Submit" onPress={handleProfileUpdate} loading={updateProfileLoading} />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={profileOptionsModalRef}
        handleTitle="Profile Options"
        enableDynamicSizing={true}
        snapPoints={["50%"]}
      >
        <BottomSheetView style={{ paddingTop: 24, paddingBottom: 48, paddingHorizontal: 36 }}>
          <View
            style={{
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
            }}
          >
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={() => {
                profileOptionsModalRef.current?.dismiss();
                editProfileModalRef.current?.present();
              }}
            >
              <View
                style={[
                  s.profileOption,
                  { borderBottomWidth: 1, borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400] },
                ]}
              >
                <Text style={{ textAlign: "center", fontSize: 18 }}>Edit Profile</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={() => {
                profileOptionsModalRef.current?.dismiss();
                setShowCamera(true);
              }}
            >
              <View
                style={[
                  s.profileOption,
                  { borderBottomWidth: 1, borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400] },
                ]}
              >
                <Text style={{ textAlign: "center", fontSize: 18 }}>Edit Profile Image</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={() => {
                profileOptionsModalRef.current?.dismiss();
                changeProfileModalRef.current?.present();
              }}
            >
              <View style={[s.profileOption]}>
                <Text style={{ textAlign: "center", fontSize: 18 }}>Switch Profile</Text>
              </View>
            </Pressable>
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 48 }}>
            <Button text="Log Out" onPress={logOut} />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <ChangeProfileModal ref={changeProfileModalRef} onAddProfilePress={handleAddProfilePress} />
    </>
  );
};

export default ProfileScreen;

const s = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.zinc[500],
    letterSpacing: 0.5,
    paddingBottom: 4,
  },
  header: {
    paddingTop: 2,
    paddingBottom: 12,
    marginBottom: 12,
  },
  profileOption: {
    paddingVertical: 16,
  },
});
