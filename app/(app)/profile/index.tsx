import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useLayoutEffect, useState } from "react";
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

import { addProfileImage, editProfileImage, updateAboutText, updateName } from "@/api/profile";
import Button from "@/components/Button/Button";
import CameraModal from "@/components/CameraModal/CameraModal";
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
    setActiveProfileId,
    selectedProfileId: authUserSelectedProfileId,
  } = useAuthUserContext();
  const {
    updateAboutText: updateAbout,
    updateProfileImage,
    authProfile,
    loading: authProfileLoading,
    updateName: updateAuthProfileName,
  } = useAuthProfileContext();

  const { isDarkMode } = useColorMode();

  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<(PhotoFile | ImagePickerAsset)[]>([]);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [updateNameModalVisible, setUpdateNameModalVisible] = useState(false);
  const [changeProfileModalVisible, setChangeProfileModalVisible] = useState(false);

  const [aboutText, setAboutText] = useState(authProfile.about ? authProfile.about : "");
  const [aboutTextLoading, setAboutTextLoading] = useState(false);
  const [profileName, setProfileName] = useState(authProfile.name ? authProfile.name : "");
  const [updateNameLoading, setUpdateNameLoading] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    if (authProfile) {
      setAboutText(authProfile.about ? authProfile.about : "");
    }
  }, [authProfile]);

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

  const handleAboutTextSubmit = async () => {
    if (aboutText && authProfile?.id) {
      setAboutTextLoading(true);
      const { error, data } = await updateAboutText(aboutText, authProfile.id);
      if (!error && data) {
        updateAbout(data.about!);
        // updateProfileDetailsAboutText(data.about!);
        setAboutModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your about text",
        });
      }
      setAboutTextLoading(false);
    }
  };

  const handleUpdateNameSubmit = async () => {
    if (profileName && authProfile?.id) {
      setUpdateNameLoading(true);
      const { error, data } = await updateName(profileName, authProfile.id);
      if (!error && data) {
        updateAuthProfileName(data.name!);
        setUpdateNameModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your name",
        });
      }
      setUpdateNameLoading(false);
    }
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
            <View style={{ padding: 16 }}>
              <Text style={s.label}>USERNAME</Text>
              <Text style={{ fontSize: 20 }}>{authProfile.username}</Text>
            </View>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={s.label}>NAME</Text>
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.2 }]}
                  onPress={() => setUpdateNameModalVisible(true)}
                  hitSlop={10}
                >
                  <Feather name="edit-3" size={16} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
                </Pressable>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  color: authProfile.name ? (isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900]) : COLORS.zinc[500],
                  fontStyle: authProfile.name ? "normal" : "italic",
                }}
              >
                {authProfile.name ? authProfile.name : "No name"}
              </Text>
            </View>

            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={s.label}>ABOUT</Text>
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.2 }]}
                  onPress={() => setAboutModalVisible(true)}
                  hitSlop={10}
                >
                  <Feather name="edit-3" size={16} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
                </Pressable>
              </View>
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
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
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
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
        animationType="slide"
        raw
        transparent={true}
        withScroll={false}
        style={{ flex: 1, alignItems: "flex-end" }}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}
          onPress={() => setAboutModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300],
                  paddingBottom: 48,
                  paddingTop: 32,
                  borderTopRightRadius: 25,
                  borderTopLeftRadius: 25,
                  paddingHorizontal: 24,
                }}
              >
                <Text>About</Text>
                <TextInput value={aboutText} onChangeText={(val) => setAboutText(val)} multiline />
                <Button text="Submit" onPress={handleAboutTextSubmit} loading={aboutTextLoading} />
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Modal
        visible={updateNameModalVisible}
        onRequestClose={() => setUpdateNameModalVisible(false)}
        animationType="slide"
        raw
        transparent={true}
        withScroll={false}
        style={{ flex: 1, alignItems: "flex-end" }}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}
          onPress={() => setUpdateNameModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300],
                  paddingBottom: 48,
                  paddingTop: 32,
                  borderTopRightRadius: 25,
                  borderTopLeftRadius: 25,
                  paddingHorizontal: 24,
                }}
              >
                <Text>Name</Text>
                <TextInput value={profileName} onChangeText={(val) => setProfileName(val)} />
                <Button text="Submit" onPress={handleUpdateNameSubmit} loading={updateNameLoading} />
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
                      onPress={() => setActiveProfileId(profile.id)}
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
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.zinc[500],
    letterSpacing: 0.5,
    paddingBottom: 6,
  },
});
