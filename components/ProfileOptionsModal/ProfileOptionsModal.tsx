import AntDesign from "@expo/vector-icons/AntDesign";
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
  editProfileModalRef: React.RefObject<RNBottomSheetModal>;
  changeProfileModalRef: React.RefObject<RNBottomSheetModal>;
};

const ProfileOptionsModal = ({
  setShowCamera,
  profileOptionsModalRef,
  editProfileModalRef,
  changeProfileModalRef,
}: Props) => {
  const { logOut } = useAuthUserContext();

  const { isDarkMode, setLightOrDark } = useColorMode();
  const router = useRouter();

  return (
    <BottomSheetModal
      ref={profileOptionsModalRef}
      handleTitle="Profile Options"
      enableDynamicSizing={true}
      snapPoints={["60%"]}
    >
      <BottomSheetView style={{ paddingTop: 24, paddingBottom: 48, paddingHorizontal: 36 }}>
        <View style={{ marginBottom: 12, flexDirection: "row", gap: 12, height: 70 }}>
          <View style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }, { flex: 1 }]}
              onPress={() => {
                profileOptionsModalRef.current?.dismiss();
                router.push("/(app)/profile/guidelines");
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
                  borderRadius: 12,
                  height: 70,
                  gap: 4,
                }}
              >
                <Foundation name="guide-dog" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
                <Text>App Guidelines</Text>
              </View>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }, { flex: 1 }]}
              onPress={() => {
                profileOptionsModalRef.current?.dismiss();
                router.push("/(app)/profile/about");
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
                  borderRadius: 12,
                  height: 70,
                  gap: 4,
                }}
              >
                <AntDesign
                  name="questioncircle"
                  size={18}
                  color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])}
                  style={{ marginTop: 5 }}
                />
                <Text>About</Text>
              </View>
            </Pressable>
          </View>
        </View>
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
              <MaterialIcons name="person" size={20} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[700]} />
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
              <Ionicons name="camera" size={20} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[700]} />
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
              <MaterialIcons name="people" size={20} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[700]} />
              <Text style={{ textAlign: "center", fontSize: 18 }}>Switch Profile</Text>
            </View>
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 48 }}>
          <Button text="Log Out" onPress={logOut} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ProfileOptionsModal;

const s = StyleSheet.create({
  profileOption: {
    paddingVertical: 16,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
});
