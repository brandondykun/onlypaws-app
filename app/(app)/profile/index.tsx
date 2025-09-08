import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import React from "react";
import { View, ScrollView, Pressable, StyleSheet, TextStyle } from "react-native";

import ChangeProfileModal from "@/components/ChangeProfileModal/ChangeProfileModal";
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
      <ProfileOptionsModal
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
