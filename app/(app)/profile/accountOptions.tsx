import { Entypo, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, TextStyle, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const ICON_SIZE = 36;

const AccountOptions = () => {
  const { user, profileOptions } = useAuthUserContext();
  const router = useRouter();
  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView contentContainerStyle={[s.root, { paddingBottom: tabBarHeight }]} showsVerticalScrollIndicator={false}>
      <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
        ACCOUNT INFORMATION
      </Text>
      <View
        style={{
          backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[925]),
          borderRadius: 12,
          marginBottom: 12,
          padding: 16,
        }}
      >
        <LabelAndText label="EMAIL" text={user?.email} />
      </View>
      <View
        style={{
          marginBottom: 48,
          backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[925]),
          borderRadius: 12,
          paddingHorizontal: 12,
        }}
      >
        <Pressable
          onPress={() => router.push("/profile/changeEmail")}
          style={({ pressed }) => [
            {
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]),
              borderBottomWidth: 1,
            },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={{ fontSize: 18 }}>Change Email</Text>
          <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/profile/changePassword")}
          style={({ pressed }) => [
            {
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={{ fontSize: 18 }}>Change Password</Text>
          <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
        </Pressable>
      </View>
      <View>
        <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          PROFILE INFORMATION
        </Text>
        <View
          style={{
            marginBottom: 12,
            backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[925]),
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text
            style={{ paddingBottom: 4, fontWeight: "400", fontSize: 16 }}
            darkColor={COLORS.zinc[400]}
            lightColor={COLORS.zinc[600]}
          >
            Your account has {profileOptions?.length} {profileOptions?.length === 1 ? "profile" : "profiles"}
          </Text>
          <View style={{ gap: 16, marginTop: 12 }}>
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
                  <Text
                    style={{ fontSize: 16, color: COLORS.zinc[500], fontStyle: profile.name ? "normal" : "italic" }}
                  >
                    {profile?.name || "No name"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            marginBottom: 48,
            backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[925]),
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <Pressable
            onPress={() => router.push("/(app)/profile/add")}
            style={({ pressed }) => [
              {
                paddingVertical: 12,
                paddingHorizontal: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]),
                borderBottomWidth: 1,
              },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={{ fontSize: 18 }}>Add Profile</Text>
            <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/profile/deleteProfile")}
            style={({ pressed }) => [
              {
                paddingVertical: 12,
                paddingHorizontal: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
              pressed && { opacity: 0.6 },
            ]}
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

type LabelAndTextProps = {
  label: string;
  text: string | undefined | null;
  placeholder?: string;
};

export const LabelAndText = ({ label, text, placeholder = "" }: LabelAndTextProps) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View>
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
  root: {
    padding: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.zinc[500],
    letterSpacing: 0.5,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
