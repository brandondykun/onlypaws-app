import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  setShowCamera: React.Dispatch<React.SetStateAction<boolean>>;
  profileOptionsModalRef: React.RefObject<RNBottomSheetModal>;
  changeProfileModalRef: React.RefObject<RNBottomSheetModal>;
};

const ProfileOptionsModal = ({ setShowCamera, profileOptionsModalRef, changeProfileModalRef }: Props) => {
  const { logOut } = useAuthUserContext();
  const { setLightOrDark } = useColorMode();
  const router = useRouter();

  // shared styling values
  const BUTTON_BG = setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]);
  const BORDER_COLOR = setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]);
  const ICON_COLOR = setLightOrDark(COLORS.zinc[900], COLORS.zinc[300]);
  const BORDER_RADIUS = 12;

  const handleGuidelinesPress = () => {
    router.push("/(app)/profile/guidelines");
    profileOptionsModalRef.current?.dismiss();
  };

  const handleAboutPress = () => {
    router.push("/(app)/profile/about");
    profileOptionsModalRef.current?.dismiss();
  };

  const handleEditProfileImagePress = () => {
    setShowCamera(true);
    profileOptionsModalRef.current?.dismiss();
  };

  const handleSwitchProfilePress = () => {
    changeProfileModalRef.current?.present();
    profileOptionsModalRef.current?.dismiss();
  };

  const handleEditUsernamePress = () => {
    router.push("/(app)/profile/editUsername");
    profileOptionsModalRef.current?.dismiss();
  };

  const handleEditProfilePress = () => {
    router.push("/(app)/profile/editProfile");
    profileOptionsModalRef.current?.dismiss();
  };

  const handleAccountOptionsPress = () => {
    router.push("/(app)/profile/accountOptions");
    profileOptionsModalRef.current?.dismiss();
  };

  return (
    <BottomSheetModal ref={profileOptionsModalRef} handleTitle="Profile Options" enableDynamicSizing snapPoints={[]}>
      <BottomSheetView style={s.root}>
        <View style={s.infoButtonsContainer}>
          <Pressable
            style={({ pressed }) => [
              pressed && s.pressed,
              s.infoButton,
              { backgroundColor: BUTTON_BG, borderRadius: BORDER_RADIUS },
            ]}
            onPress={handleGuidelinesPress}
          >
            <Foundation name="guide-dog" size={24} color={ICON_COLOR} />
            <Text>App Guidelines</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              pressed && s.pressed,
              s.infoButton,
              { backgroundColor: BUTTON_BG, borderRadius: BORDER_RADIUS },
            ]}
            onPress={handleAboutPress}
          >
            <AntDesign name="questioncircle" size={18} color={ICON_COLOR} style={{ marginTop: 6 }} />
            <Text>About</Text>
          </Pressable>
        </View>
        <View style={{ backgroundColor: BUTTON_BG, borderRadius: BORDER_RADIUS, marginBottom: 12 }}>
          <Pressable
            style={({ pressed }) => [
              pressed && s.pressed,
              s.centeredButton,
              { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
            ]}
            onPress={handleEditProfileImagePress}
          >
            <Ionicons name="camera" size={20} color={ICON_COLOR} />
            <Text style={s.buttonText}>Edit Profile Image</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [pressed && s.pressed, s.centeredButton]}
            onPress={handleSwitchProfilePress}
          >
            <MaterialIcons name="people" size={20} color={ICON_COLOR} />
            <Text style={s.buttonText}>Switch Profile</Text>
          </Pressable>
        </View>
        <View style={{ backgroundColor: BUTTON_BG, borderRadius: BORDER_RADIUS }}>
          <Pressable
            style={({ pressed }) => [
              pressed && s.pressed,
              s.linkButton,
              { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
            ]}
            onPress={handleEditUsernamePress}
          >
            <Text style={s.buttonText}>Edit Username</Text>
            <Entypo name="chevron-small-right" size={24} color={ICON_COLOR} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              pressed && s.pressed,
              s.linkButton,
              { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
            ]}
            onPress={handleEditProfilePress}
          >
            <Text style={s.buttonText}>Edit Profile</Text>
            <Entypo name="chevron-small-right" size={24} color={ICON_COLOR} />
          </Pressable>
          <Pressable style={({ pressed }) => [pressed && s.pressed, s.linkButton]} onPress={handleAccountOptionsPress}>
            <Text style={s.buttonText}>Account Options</Text>
            <Entypo name="chevron-small-right" size={24} color={ICON_COLOR} />
          </Pressable>
        </View>
        <View style={s.logoutButtonContainer}>
          <Button text="Log Out" onPress={logOut} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ProfileOptionsModal;

const s = StyleSheet.create({
  root: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 36,
  },
  infoButtonsContainer: {
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    height: 70,
  },
  centeredButton: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  linkButton: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
  },
  pressed: {
    opacity: 0.6,
  },
  infoButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    gap: 4,
  },
  logoutButtonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 48,
  },
});
