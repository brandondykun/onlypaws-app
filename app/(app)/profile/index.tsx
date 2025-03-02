import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ImagePickerAsset } from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useLayoutEffect, useRef, useState } from "react";
import React from "react";
import { View, ScrollView, Pressable, StyleSheet, TextStyle } from "react-native";
import Toast from "react-native-toast-message";
import { PhotoFile } from "react-native-vision-camera";

import { addProfileImage, editProfileImage } from "@/api/profile";
import CameraModal from "@/components/CameraModal/CameraModal";
import ChangeProfileModal from "@/components/ChangeProfileModal/ChangeProfileModal";
import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import ProfileOptionsModal from "@/components/ProfileOptionsModal/ProfileOptionsModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

const ProfileScreen = () => {
  const { user } = useAuthUserContext();
  const { updateProfileImage, authProfile } = useAuthProfileContext();

  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const profileOptionsModalRef = useRef<RNBottomSheetModal>(null);
  const changeProfileModalRef = useRef<RNBottomSheetModal>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<(PhotoFile | ImagePickerAsset)[]>([]);

  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPressOut={() => profileOptionsModalRef.current?.present()}
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

  const handleAddProfilePress = () => {
    changeProfileModalRef?.current?.close();
    router.push("/(app)/profile/add");
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: tabBarHeight }}
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
        onBackButtonPress={() => setImage([])} // clear temp image if profile image was not updated
        isProfileImage={true}
      />
      <ProfileOptionsModal
        setShowCamera={setShowCamera}
        profileOptionsModalRef={profileOptionsModalRef}
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

export const LabelAndText = ({ label, text, placeholder = "" }: LabelAndTextProps) => {
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
