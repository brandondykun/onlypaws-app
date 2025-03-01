import { Entypo, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

import { LabelAndText } from "./index";

const ICON_SIZE = 36;

const AccountOptions = () => {
  const { user, profileOptions } = useAuthUserContext();
  const router = useRouter();
  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView contentContainerStyle={[s.root, { paddingBottom: tabBarHeight }]} showsVerticalScrollIndicator={false}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 12,
          color: COLORS.zinc[500],
        }}
      >
        ACCOUNT INFORMATION
      </Text>
      <View
        style={{
          backgroundColor: setLightOrDark(COLORS.zinc[125], COLORS.zinc[900]),
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <LabelAndText label="EMAIL" text={user?.email} />
      </View>
      <View
        style={{
          marginBottom: 48,
          borderTopWidth: 1,
          borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
          borderBottomWidth: 1,
        }}
      >
        <Pressable
          onPress={() => router.push("/profile/changeEmail")}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ fontSize: 18 }}>Change Email</Text>
          <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/profile/changePassword")}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>Change Password</Text>
          <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
        </Pressable>
      </View>
      <View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 12,
            color: COLORS.zinc[500],
          }}
        >
          PROFILE(S) INFORMATION
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={{ fontSize: 16, marginBottom: 24 }}>
            Profiles ({profileOptions?.length})
          </Text>
        </View>
        <View style={{ marginBottom: 32, gap: 16 }}>
          {profileOptions?.map((profile) => (
            <View key={profile.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
                  <Ionicons
                    name="paw"
                    size={ICON_SIZE - 20}
                    color={setLightOrDark(COLORS.zinc[300], COLORS.zinc[600])}
                  />
                </View>
              )}
              <View>
                <Text style={{ fontSize: 20 }}>{profile.username}</Text>
                <Text style={{ fontSize: 16, color: COLORS.zinc[500], fontStyle: profile.name ? "normal" : "italic" }}>
                  {profile?.name || "No name"}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View
          style={{
            marginBottom: 48,
            borderTopWidth: 1,
            borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
            borderBottomWidth: 1,
          }}
        >
          <Pressable
            onPress={() => router.push("/(app)/profile/add")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 18 }}>Add Profile</Text>
            <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/profile/deleteProfile")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>Delete Profile</Text>
            <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default AccountOptions;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
});
