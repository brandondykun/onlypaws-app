import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { PhotoFile } from "react-native-vision-camera";

import { addProfileImage, editProfileImage, updateProfile, getPetTypeOptions } from "@/api/profile";
import Button from "@/components/Button/Button";
import CameraModal from "@/components/CameraModal/CameraModal";
import DropdownSelect, { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import Modal from "@/components/Modal/Modal";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

const ProfileScreen = () => {
  const {
    user,
    logOut,
    profileOptions,
    changeSelectedProfileId,
    selectedProfileId: authUserSelectedProfileId,
  } = useAuthUserContext();
  const { updateProfileImage, authProfile, updateAuthProfile, loading: authProfileLoading } = useAuthProfileContext();

  const { isDarkMode } = useColorMode();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changeProfileModalVisible, setChangeProfileModalVisible] = useState(false);

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
    setEditModalVisible(false);
  };

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => setChangeProfileModalVisible(true)}
          variant="text"
          text="Change"
          icon={
            <MaterialCommunityIcons
              name="rotate-3d-variant"
              size={18}
              color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]}
            />
          }
        />
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
        setEditModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your about text",
        });
      }
      setUpdateProfileLoading(false);
    }
  };

  const handleChangeProfile = async (profileId: number) => {
    await changeSelectedProfileId(profileId);
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View>
          <View style={{ marginBottom: 36 }}>
            <Pressable style={({ pressed }) => [pressed && { opacity: 0.7 }]} onPress={() => setShowCamera(true)}>
              <View
                style={{
                  backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                  height: 130,
                  width: 130,
                  borderRadius: 150,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 2,
                  position: "relative",
                }}
              >
                <MaterialCommunityIcons name="dog" size={72} color={isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400]} />
                <View
                  style={{
                    height: 30,
                    width: 30,
                    backgroundColor: COLORS.sky[600],
                    borderRadius: 50,
                    position: "absolute",
                    right: 5,
                    bottom: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2,
                  }}
                >
                  <Feather name="edit-3" size={16} color={COLORS.zinc[50]} />
                </View>
                {authProfile.image ? (
                  <Image
                    source={{ uri: authProfile.image.image }}
                    style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0, borderRadius: 150 }}
                  />
                ) : null}
              </View>
            </Pressable>
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
          <View style={{ alignItems: "flex-end", paddingRight: 4 }}>
            <Button
              text="Edit"
              icon={<Feather name="edit-3" size={16} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />}
              onPress={() => setEditModalVisible(true)}
              hitSlop={10}
              variant="text"
            />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 48 }}>
          <Button text="Log Out" onPress={logOut} />
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
      <Modal
        visible={editModalVisible}
        onRequestClose={handleEditModalClose}
        animationType="slide"
        raw
        transparent={true}
        withScroll={false}
        style={{ flex: 1, alignItems: "flex-end" }}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}
          onPress={handleEditModalClose}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
                  paddingBottom: 48,
                  paddingTop: 16,
                  borderTopRightRadius: 25,
                  borderTopLeftRadius: 25,
                  paddingHorizontal: 24,
                }}
              >
                <View style={s.header}>
                  <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>Edit Profile</Text>
                </View>
                <View>
                  <Text>Name</Text>
                  <TextInput
                    value={profileName}
                    onChangeText={(val) => setProfileName(val)}
                    placeholder="ex: Charlie"
                  />
                </View>
                <View>
                  <Text>About</Text>
                  <TextInput value={aboutText} onChangeText={(val) => setAboutText(val)} multiline numberOfLines={5} />
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
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Modal
        visible={changeProfileModalVisible}
        onRequestClose={() => setChangeProfileModalVisible(false)}
        animationType="slide"
        raw
        transparent={true}
        withScroll={false}
        style={{ flex: 1, alignItems: "flex-end" }}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}
          onPress={() => setChangeProfileModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Pressable onPress={(e) => e.stopPropagation()} android_disableSound={true}>
              <View
                style={{
                  backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
                  paddingBottom: 48,
                  paddingTop: 18,
                  borderTopRightRadius: 25,
                  borderTopLeftRadius: 25,
                  paddingHorizontal: 24,
                  gap: 12,
                }}
              >
                <View style={{ paddingBottom: 12 }}>
                  <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>Change Profile</Text>
                </View>
                {profileOptions?.map((profile) => {
                  const isSelected = profile.id === authProfile.id;
                  const isSelectedButLoading = authUserSelectedProfileId === profile.id && authProfileLoading;
                  return (
                    <Pressable
                      key={profile.id}
                      style={({ pressed }) => [pressed && !isSelected && { opacity: 0.7 }]}
                      disabled={isSelected || authProfileLoading}
                      onPress={() => handleChangeProfile(profile.id)}
                    >
                      <View
                        style={[
                          s.profileOption,
                          {
                            backgroundColor: isDarkMode ? COLORS.zinc[600] : COLORS.zinc[50],
                            borderColor:
                              isSelected && isDarkMode
                                ? COLORS.lime[600]
                                : isSelected
                                  ? COLORS.lime[500]
                                  : isDarkMode
                                    ? COLORS.zinc[800]
                                    : COLORS.zinc[200],
                          },
                        ]}
                      >
                        <Text style={s.profileOptionText}>{profile.username}</Text>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle-sharp" size={24} color={COLORS.lime[500]} />
                        ) : null}
                        {isSelectedButLoading ? <ActivityIndicator size="small" color={COLORS.lime[500]} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
                <View style={{ paddingTop: 16, paddingLeft: 8 }}>
                  <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 16, fontStyle: "italic" }}>
                    Have another pet?
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setChangeProfileModalVisible(false);
                    router.push("/(app)/profile/add");
                  }}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  disabled={authProfileLoading}
                >
                  <View
                    style={[
                      s.profileOption,
                      {
                        backgroundColor: isDarkMode ? COLORS.zinc[600] : COLORS.zinc[50],
                        borderColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                      },
                    ]}
                  >
                    <Text style={[s.profileOptionText, { color: isDarkMode ? COLORS.zinc[300] : COLORS.zinc[700] }]}>
                      Add Another Profile
                    </Text>
                    <AntDesign name="pluscircle" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[700]} />
                  </View>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
};

export default ProfileScreen;

const s = StyleSheet.create({
  profileOption: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
  },
  profileOptionText: {
    fontSize: 16,
  },
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
});
