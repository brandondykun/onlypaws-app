import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import React from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";

import ChangeProfileModal from "@/components/ChangeProfileModal/ChangeProfileModal";
import MissingProfileInfoMessage from "@/components/MissingProfileInfoMessage/MissingProfileInfoMessage";
import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import ProfileOptionsModal from "@/components/ProfileOptionsModal/ProfileOptionsModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const ProfileScreen = () => {
  const { user } = useAuthUserContext();
  const { authProfile } = useAuthProfileContext();

  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const profileOptionsModalRef = useRef<RNBottomSheetModal>(null);
  const changeProfileModalRef = useRef<RNBottomSheetModal>(null);

  const navigation = useNavigation();
  const router = useRouter();

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => router.push("/(app)/profile/qrCode")}
          style={({ pressed }) => [pressed && { opacity: 0.7 }, { paddingVertical: 8 }]}
          hitSlop={20}
          testID="view-qr-code-button"
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={22}
            color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[200])}
          />
        </Pressable>
      ),
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

  const handleAddProfilePress = () => {
    changeProfileModalRef?.current?.close();
    router.push("/(app)/profile/add");
  };

  // Create a string of 'pet type • breed'
  const toJoin = [];
  if (authProfile.pet_type) toJoin.push(authProfile.pet_type.name);
  if (authProfile.breed) toJoin.push(authProfile.breed);
  const petDetailsText = toJoin.join(" • ");

  const missingProfileInfo =
    !authProfile.name || !petDetailsText || !authProfile.about || !authProfile.pet_type || !authProfile.breed;

  return (
    <>
      <ScrollView
        contentContainerStyle={[s.scrollViewContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerImageContainer}>
          <View style={s.relativeImageWrapper}>
            <ProfileDetailsHeaderImage image={authProfile.image} size={125} />
            <Pressable
              style={({ pressed }) => [s.editProfileImagePressable, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/(app)/profile/profileImageCamera")}
              hitSlop={10}
            >
              <View style={s.editProfileImageButton}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.zinc[200]} />
              </View>
            </Pressable>
          </View>
        </View>
        <View style={s.headerTextContainer}>
          {authProfile.name && <Text style={s.headerName}>{authProfile.name}</Text>}
          <Text style={s.headerUsername} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            @{authProfile.username}
          </Text>
          {petDetailsText && (
            <Text style={s.headerBreed} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              {petDetailsText}
            </Text>
          )}
        </View>
        {missingProfileInfo && <MissingProfileInfoMessage />}
        <View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]}>
          <Text style={s.cardTitle} darkColor={COLORS.zinc[50]} lightColor={COLORS.zinc[800]}>
            Account
          </Text>
          <View style={s.accountItems}>
            <View style={s.accountItemContainer}>
              <View style={[s.iconContainer, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]) }]}>
                <Feather name="mail" size={20} color={setLightOrDark(COLORS.sky[500], COLORS.sky[500])} />
              </View>
              <View>
                <Text style={s.accountItemTitle} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[800]}>
                  Email
                </Text>
                <Text style={{ fontSize: 16 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
                  {user.email}
                </Text>
              </View>
            </View>
            <View style={s.accountItemContainer}>
              <View style={[s.iconContainer, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]) }]}>
                <Ionicons name="at" size={24} color={setLightOrDark(COLORS.sky[500], COLORS.sky[500])} />
              </View>
              <View>
                <Text style={s.accountItemTitle} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[800]}>
                  Username
                </Text>
                <Text style={{ fontSize: 16 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
                  @{authProfile.username}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]}>
          <Text style={s.cardTitle} darkColor={COLORS.zinc[50]} lightColor={COLORS.zinc[800]}>
            About
          </Text>
          <Text style={s.aboutText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
            {authProfile.about ? authProfile.about : "No about text"}
          </Text>
        </View>
      </ScrollView>
      <ProfileOptionsModal
        profileOptionsModalRef={profileOptionsModalRef}
        changeProfileModalRef={changeProfileModalRef}
      />
      <ChangeProfileModal ref={changeProfileModalRef} onAddProfilePress={handleAddProfilePress} />
      {/* <QrCodeModal visible={qrCodeModalVisible} onClose={handleQrCodeModalClose} /> */}
    </>
  );
};

export default ProfileScreen;

const s = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerImageContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  relativeImageWrapper: {
    position: "relative",
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
  },
  editProfileImagePressable: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 4,
    right: -2,
    backgroundColor: COLORS.sky[500],
    borderRadius: 100,
    height: 34,
    width: 34,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  headerTextContainer: {
    marginBottom: 28,
  },
  headerName: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  headerUsername: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 6,
  },
  headerBreed: {
    fontSize: 16,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 18,
  },
  iconContainer: {
    borderRadius: 8,
    height: 45,
    width: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  accountItemTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 2,
  },
  aboutText: {
    fontSize: 18,
    fontWeight: "300",
    lineHeight: 24,
  },
  accountItems: {
    gap: 16,
  },
  accountItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
