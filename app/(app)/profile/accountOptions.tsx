import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { logOut as logOutApi } from "@/api/auth";
import ScreenLinkButton from "@/components/ScreenLinkButton/ScreeLinkButton";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import * as tokenService from "@/services/tokenService";

const ICON_SIZE = 36;

const AccountOptions = () => {
  const { user, profileOptions, logOut } = useAuthUserContext();
  const { setLightOrDark } = useColorMode();

  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [logOutLoading, setLogOutLoading] = useState(false);

  const sectionBorderColor = setLightOrDark(COLORS.zinc[300], COLORS.zinc[900]);
  const iconColor = setLightOrDark(COLORS.zinc[900], COLORS.zinc[300]);

  const handleLogOut = async () => {
    setLogOutLoading(true);
    // Get refresh token and call backend logout API to clear server-side tokens
    const refreshToken = await tokenService.getRefreshToken();
    if (refreshToken) {
      await logOutApi(refreshToken);
    }
    // Clear local state and tokens
    await logOut();
  };

  return (
    <ScrollView
      contentContainerStyle={[s.root, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.headerRow}>
        <View style={s.headerIconWrapper}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={24}
            color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])}
          />
        </View>
        <View style={s.headerTextWrapper}>
          <Text style={s.headerTitle}>Account Options</Text>
          <Text style={s.headerSubtitle} lightColor={COLORS.zinc[700]} darkColor={COLORS.zinc[400]}>
            Your control center for account settings and managing your pet profiles.
          </Text>
        </View>
      </View>
      {/* Account Section */}
      <View style={[s.section, { borderTopColor: sectionBorderColor }]}>
        <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          Your account
        </Text>
        {user?.email && (
          <View style={s.accountEmailContainer}>
            <Text style={s.emailLabel} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              Your account email
            </Text>
            <Text style={[s.emailValue, { color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[300]) }]}>
              {user?.email}
            </Text>
          </View>
        )}
        <ScreenLinkButton
          title="Change Email"
          onPress={() => router.push("/profile/changeEmail")}
          icon={<MaterialIcons name="alternate-email" size={20} color={iconColor} />}
        />
        <ScreenLinkButton
          title="Change Password"
          onPress={() => router.push("/profile/changePassword")}
          icon={<MaterialIcons name="password" size={20} color={iconColor} />}
        />
      </View>

      {/* Profiles Section */}
      <View style={[s.section, { borderTopColor: sectionBorderColor }]}>
        <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          Your profiles
        </Text>
        <View style={s.profilesBlock}>
          <Text style={s.profilesCountText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            You have {profileOptions?.length} {profileOptions?.length === 1 ? "profile" : "profiles"}
          </Text>
          <View style={s.profileList}>
            {profileOptions?.map((profile) => (
              <View key={profile.id} style={s.profileRow}>
                {profile.image ? (
                  <Image source={{ uri: profile.image.image }} style={s.profileAvatarImage} />
                ) : (
                  <View
                    style={[
                      s.profileAvatarPlaceholder,
                      { backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[800]) },
                    ]}
                  >
                    <Ionicons
                      name="paw"
                      size={ICON_SIZE - 20}
                      color={setLightOrDark(COLORS.zinc[300], COLORS.zinc[600])}
                    />
                  </View>
                )}
                <View>
                  <Text style={s.profileUsername} darkColor={COLORS.zinc[300]}>
                    {profile.username}
                  </Text>
                  <Text
                    style={[
                      s.profileDisplayName,
                      { color: COLORS.zinc[500], fontStyle: profile.name ? "normal" : "italic" },
                    ]}
                  >
                    {profile?.name || "No name"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <ScreenLinkButton
          title="Add Profile"
          onPress={() => router.push("/(app)/profile/add")}
          icon={<Ionicons name="add-circle-outline" size={22} color={iconColor} />}
        />
        <ScreenLinkButton
          title="Delete Profile"
          onPress={() => router.push("/profile/deleteProfile")}
          icon={<Ionicons name="remove-circle-outline" size={22} color={iconColor} />}
        />
      </View>

      {/* Reports Section */}
      <View style={[s.section, { borderTopColor: sectionBorderColor }]}>
        <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          Reports
        </Text>
        <ScreenLinkButton
          title="Profile Reports"
          onPress={() => router.push("/(app)/profile/profileReports")}
          icon={<MaterialCommunityIcons name="account-alert-outline" size={20} color={iconColor} />}
        />
        <ScreenLinkButton
          title="Post Reports"
          onPress={() => router.push("/(app)/profile/postReports")}
          icon={<MaterialCommunityIcons name="alert-box-outline" size={20} color={iconColor} />}
        />
      </View>

      {/* App Options Section */}
      <View style={[s.section, { borderTopColor: sectionBorderColor }]}>
        <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          App options
        </Text>
        <ScreenLinkButton
          title="App Details"
          onPress={() => router.push("/(app)/profile/appDetails")}
          icon={<MaterialIcons name="settings-applications" size={22} color={iconColor} />}
        />
        <ScreenLinkButton
          title="Give Feedback"
          onPress={() => router.push("/(app)/profile/feedback")}
          icon={<MaterialCommunityIcons name="chat-processing-outline" size={23} color={iconColor} />}
        />
        <ScreenLinkButton
          title="Guidelines"
          onPress={() => router.push("/(app)/profile/guidelines")}
          icon={<Octicons name="checklist" size={20} color={iconColor} />}
        />
        <ScreenLinkButton
          title="About OnlyPaws"
          onPress={() => router.push("/(app)/profile/about")}
          icon={<Ionicons name="information-circle-outline" size={22} color={iconColor} />}
        />
      </View>

      {/* Authentication Section */}
      <View style={[s.section, { borderTopColor: sectionBorderColor }]}>
        <Text style={s.sectionTitle} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          Authentication
        </Text>
        <View>
          <Pressable
            onPress={handleLogOut}
            style={({ pressed }) => [s.logOutButton, pressed && s.logOutButtonPressed]}
            disabled={logOutLoading}
          >
            <Text style={s.logOutButtonText} darkColor={COLORS.red[600]} lightColor={COLORS.red[600]}>
              Log Out
            </Text>
            {logOutLoading ? (
              <ActivityIndicator size="small" color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
            ) : (
              <Feather name="log-out" size={18} color={COLORS.red[600]} />
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default AccountOptions;

const s = StyleSheet.create({
  root: {
    paddingTop: 16,
    flexGrow: 1,
  },
  headerRow: {
    padding: 16,
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 12,
  },
  headerIconWrapper: {
    paddingTop: 2,
  },
  headerTextWrapper: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    flexBasis: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  section: {
    paddingHorizontal: 16,
    borderTopWidth: 6,
    paddingTop: 20,
    paddingBottom: 16,
  },
  accountEmailContainer: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingLeft: 16,
  },
  emailLabel: {
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 16,
  },
  emailValue: {
    fontSize: 20,
  },
  profilesBlock: {
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 16,
  },
  profilesCountText: {
    paddingVertical: 0,
    fontWeight: "400",
    fontSize: 16,
  },
  profileList: {
    gap: 16,
    marginTop: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileAvatarImage: {
    borderRadius: ICON_SIZE,
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
  profileAvatarPlaceholder: {
    height: ICON_SIZE,
    width: ICON_SIZE,
    borderRadius: ICON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  profileUsername: {
    fontSize: 20,
  },
  profileDisplayName: {
    fontSize: 16,
  },
  logOutButton: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logOutButtonPressed: {
    opacity: 0.6,
  },
  logOutButtonText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
