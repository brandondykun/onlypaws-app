import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { deleteProfile } from "@/api/profile";
import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import Modal from "@/components/Modal/Modal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import toast from "@/utils/toast";

const ICON_SIZE = 36;

const DeleteProfileScreen = () => {
  const { profileOptions, removeProfileOption, setActiveProfileId } = useAuthUserContext();
  const { authProfile } = useAuthProfileContext();
  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const bottomSheetRef = useRef<RNBottomSheetModal>(null);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectProfile = (profileId: string) => {
    if (selectedProfileId === profileId) {
      setSelectedProfileId(null);
    } else {
      setSelectedProfileId(profileId);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return;
    // check to not allow deleting the last remaining profile
    if (profileOptions?.length === 1) return;

    setLoading(true);
    const { error } = await deleteProfile(selectedProfileId);
    if (error) {
      // show error toast
      bottomSheetRef.current?.close();
      // give enough time for the bottom sheet to close before showing the toast
      setTimeout(() => {
        toast.error("There was an error deleting that profile. Please try again.", { visibilityTime: 5000 });
      }, 350);
    } else {
      // remove profile from profileOptions context
      removeProfileOption(selectedProfileId);

      // if the profile deleted is the currently selected profile, auto select another profile
      if (selectedProfileId === authProfile?.public_id) {
        const autoSelectedProfile = profileOptions?.find((option) => option.public_id !== selectedProfileId);
        if (autoSelectedProfile) {
          setActiveProfileId(autoSelectedProfile.public_id);
        }
      }
      toast.success("Profile deleted successfully.");
      setSelectedProfileId(null);
    }
    setLoading(false);
  };

  const selectedProfile = profileOptions?.find((profile) => profile.public_id === selectedProfileId);

  return (
    <ScrollView
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 24, marginTop: 12, marginBottom: 24 }}>Select a profile to delete</Text>
      <View style={{ marginBottom: 36 }}>
        {profileOptions && profileOptions.length > 1 ? (
          <Text style={{ fontSize: 16, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
            Deleting a profile will remove all data associated with the profile and cannot be undone.
          </Text>
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
            Your account only has one profile, so it cannot be deleted. If you want to delete your account, please go to
            the delete account page.
          </Text>
        )}
      </View>
      <View style={{ gap: 16, flex: 1 }}>
        {profileOptions?.map((profile) => (
          <Pressable
            key={profile.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            onPress={() => {
              if (profileOptions.length > 1) {
                handleSelectProfile(profile.public_id);
              }
            }}
          >
            {profile.image ? (
              <Image
                source={{ uri: profile.image.image }}
                style={{ borderRadius: ICON_SIZE, height: ICON_SIZE, width: ICON_SIZE }}
              />
            ) : (
              <View
                style={{
                  height: ICON_SIZE,
                  width: ICON_SIZE,
                  borderRadius: ICON_SIZE,
                  backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[800]),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="paw" size={ICON_SIZE - 20} color={setLightOrDark(COLORS.zinc[300], COLORS.zinc[600])} />
              </View>
            )}
            <View
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flex: 1 }}
            >
              <View>
                <Text style={{ fontSize: 20 }}>{profile.username}</Text>
                <Text style={{ fontSize: 16, color: COLORS.zinc[500], fontStyle: profile.name ? "normal" : "italic" }}>
                  {profile?.name || "No name"}
                </Text>
              </View>
              <Checkbox isChecked={selectedProfileId === profile.public_id} testID={`checkbox-${profile.username}`} />
            </View>
          </Pressable>
        ))}
      </View>
      <View style={{ marginTop: 48 }}>
        {profileOptions && profileOptions?.length > 1 ? (
          <Button
            text="Delete Profile"
            onPress={() => bottomSheetRef.current?.present()}
            buttonStyle={{ backgroundColor: setLightOrDark(COLORS.red[700], COLORS.red[600]) }}
            disabled={selectedProfileId === null}
          />
        ) : null}
      </View>
      <BottomSheetModal ref={bottomSheetRef} handleTitle="Delete Profile" snapPoints={[]} enableDynamicSizing={true}>
        <BottomSheetView style={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 16 }}>
          <View style={{ marginBottom: 24, gap: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>Are you sure you want to delete this profile?</Text>
            {selectedProfile ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {selectedProfile.image ? (
                  <Image
                    source={{ uri: selectedProfile.image.image }}
                    style={{ borderRadius: ICON_SIZE, height: ICON_SIZE, width: ICON_SIZE }}
                  />
                ) : (
                  <View
                    style={{
                      height: ICON_SIZE,
                      width: ICON_SIZE,
                      borderRadius: ICON_SIZE,
                      backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[700]),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="paw"
                      size={ICON_SIZE - 20}
                      color={setLightOrDark(COLORS.zinc[300], COLORS.zinc[500])}
                    />
                  </View>
                )}
                <View>
                  <Text style={{ fontSize: 20 }}>{selectedProfile.username}</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: COLORS.zinc[500],
                      fontStyle: selectedProfile.name ? "normal" : "italic",
                    }}
                  >
                    {selectedProfile?.name || "No name"}
                  </Text>
                </View>
              </View>
            ) : null}
            <Text style={{ fontSize: 16, fontWeight: "300" }} darkColor={COLORS.zinc[400]}>
              This action cannot be undone and the data will be permanently deleted.
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                text="Delete Profile"
                onPress={() => {
                  handleDeleteProfile();
                  bottomSheetRef.current?.close();
                }}
                buttonStyle={{ backgroundColor: COLORS.red[600] }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                text="Cancel"
                variant="secondary"
                onPress={() => {
                  setSelectedProfileId(null);
                  bottomSheetRef.current?.close();
                }}
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <Modal visible={loading} animationType="fade" withScroll={false} transparent={true} raw={true}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: setLightOrDark("rgba(255, 255, 255, 0.9)", "rgba(0, 0, 0, 0.85)"),
          }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View>
            <LottieView
              style={{ height: 150, width: 150 }}
              source={require("../../../assets/animations/deleting-animation.json")}
              autoPlay
              loop
            />
          </View>
          <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={{ fontSize: 26, fontWeight: "300" }}>
            Deleting Profile
          </Text>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DeleteProfileScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
  },
});
