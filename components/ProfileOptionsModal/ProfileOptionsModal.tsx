import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  profileOptionsModalRef: React.RefObject<RNBottomSheetModal | null>;
  changeProfileModalRef: React.RefObject<RNBottomSheetModal | null>;
};

const ProfileOptionsModal = ({ profileOptionsModalRef, changeProfileModalRef }: Props) => {
  const { setLightOrDark } = useColorMode();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // shared styling values
  const BUTTON_BG = setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]);
  const BORDER_COLOR = setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]);
  const ICON_COLOR = setLightOrDark(COLORS.zinc[950], COLORS.zinc[300]);
  const BORDER_RADIUS = 16;

  const handleEditProfileImagePress = () => {
    profileOptionsModalRef.current?.dismiss();
    router.push("/(app)/profile/profileImageCamera");
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
      <BottomSheetView style={{ ...s.root, paddingBottom: insets.bottom + 16 }}>
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
          {/* Edit Username Button */}
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

          {/* Edit Profile Button */}
          <Pressable
            style={({ pressed }) => [
              pressed && s.pressed,
              s.linkButton,
              { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
            ]}
            onPress={handleEditProfilePress}
            testID="edit-profile-button"
          >
            <Text style={s.buttonText}>Edit Profile</Text>
            <Entypo name="chevron-small-right" size={24} color={ICON_COLOR} />
          </Pressable>

          {/* Account Options Button */}
          <Pressable style={({ pressed }) => [pressed && s.pressed, s.linkButton]} onPress={handleAccountOptionsPress}>
            <Text style={s.buttonText}>Account Options</Text>
            <Entypo name="chevron-small-right" size={24} color={ICON_COLOR} />
          </Pressable>
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
});
