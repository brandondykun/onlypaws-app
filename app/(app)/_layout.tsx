import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { Tabs, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";

import OnboardingModal from "@/components/OnboardingModal/OnboardingModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import AnnouncementsContextProvider from "@/context/AnnouncementsContext";
import AuthProfileContextProvider from "@/context/AuthProfileContext";
import AuthProfileFollowersContextProvider from "@/context/AuthProfileFollowersContext";
import AuthProfileFollowingContextProvider from "@/context/AuthProfileFollowingContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import ExplorePostsContextProvider from "@/context/ExplorePostsContext";
import NotificationsContextProvider from "@/context/NotificationsContext";
import { useNotificationsContext } from "@/context/NotificationsContext";
import PostManagerContextProvider from "@/context/PostManagerContext";
import PostsContextProvider from "@/context/PostsContext";
import ProfileDetailsManagerContextProvider from "@/context/ProfileDetailsManagerContext";
import ProfileSearchContextProvider from "@/context/ProfileSearchContext";
import ReportReasonsContextProvider from "@/context/ReportReasonsContext";

const TabsComponent = () => {
  const { isDarkMode, setLightOrDark } = useColorMode();
  const { unreadCount } = useNotificationsContext();
  const segment = useSegments();

  let notificationsCountFormatted = undefined;

  if (unreadCount > 99) {
    notificationsCountFormatted = "99+";
  } else if (unreadCount > 0) {
    notificationsCountFormatted = unreadCount.toString();
  }

  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        backBehavior="history"
        screenOptions={{
          tabBarActiveTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
          tabBarInactiveTintColor: setLightOrDark(COLORS.zinc[500], COLORS.zinc[600]),
          tabBarLabel: ({ focused, children }) => {
            return (
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    fontWeight: focused ? "700" : "500",
                    color: focused
                      ? setLightOrDark(COLORS.zinc[950], COLORS.zinc[50])
                      : setLightOrDark(COLORS.zinc[600], COLORS.zinc[500]),
                  }}
                >
                  {children}
                </Text>
                {focused ? (
                  <View
                    style={{
                      width: 6,
                      height: 3,
                      borderRadius: 5,
                      backgroundColor: setLightOrDark(COLORS.sky[600], COLORS.sky[500]),
                    }}
                  />
                ) : null}
              </View>
            );
          },
          tabBarStyle: s.tabBarStyle,
          headerShadowVisible: false, // applied here
          tabBarBackground: () => {
            // only show blur view on ios
            if (Platform.OS === "ios") {
              return (
                <BlurView
                  style={{
                    flex: 1,
                    backgroundColor: setLightOrDark("#e4e4e7CC", `#050506CC`),
                  }}
                  intensity={isDarkMode ? 20 : 10}
                  tint={isDarkMode ? "dark" : "light"}
                />
              );
            } else {
              return (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
                  }}
                />
              );
            }
          },
        }}
      >
        <Tabs.Screen
          name="(index)"
          options={{
            title: "Feed",
            tabBarIcon: ({ color }) => <Octicons name="home-fill" size={20} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => <FontAwesome name="search" size={20} color={color} style={{ marginTop: -2 }} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add Post",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="camera-enhance" size={24} color={color} />,
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="posts"
          options={{
            title: "Posts",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="camera-burst" size={24} color={color} />,
            headerShown: false,
            tabBarBadge: notificationsCountFormatted,
            tabBarBadgeStyle: { fontSize: 12 },
            tabBarStyle: segment[2] === "editPost" ? { display: "none" } : s.tabBarStyle,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <Ionicons name="paw" size={20} color={color} />,
            headerShown: false,
            tabBarStyle: segment[2] === "profileImageCamera" ? { display: "none" } : s.tabBarStyle,
          }}
        />
      </Tabs>
      <OnboardingModal />
    </>
  );
};

const TabLayout = () => {
  const { isDarkMode } = useColorMode();

  const { authLoading, isAuthenticated, user } = useAuthUserContext();

  if (authLoading) {
    return (
      <View style={[s.loadingView, { backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[100] }]}>
        <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={s.loadingViewText}>
          Loading
        </Text>
        <ActivityIndicator size="small" color={COLORS.zinc[500]} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  if (!user.is_email_verified) {
    return <Redirect href="/auth/verifyEmail" />;
  }

  // Check if user has at least one profile
  if (!user.profiles || user.profiles.length === 0) {
    return <Redirect href="../onboarding/" />;
  }

  return (
    <AuthProfileContextProvider>
      <BottomSheetModalProvider>
        <PostsContextProvider>
          <AnnouncementsContextProvider>
            <ExplorePostsContextProvider>
              <ProfileSearchContextProvider>
                <AuthProfileFollowingContextProvider>
                  <AuthProfileFollowersContextProvider>
                    <PostManagerContextProvider>
                      <ProfileDetailsManagerContextProvider>
                        <NotificationsContextProvider>
                          <ReportReasonsContextProvider>
                            <TabsComponent />
                          </ReportReasonsContextProvider>
                        </NotificationsContextProvider>
                      </ProfileDetailsManagerContextProvider>
                    </PostManagerContextProvider>
                  </AuthProfileFollowersContextProvider>
                </AuthProfileFollowingContextProvider>
              </ProfileSearchContextProvider>
            </ExplorePostsContextProvider>
          </AnnouncementsContextProvider>
        </PostsContextProvider>
      </BottomSheetModalProvider>
    </AuthProfileContextProvider>
  );
};

export default TabLayout;

const s = StyleSheet.create({
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingViewText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "300",
  },
  tabBarStyle: {
    borderTopWidth: 0,
    elevation: 0,
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "transparent",
  },
});
