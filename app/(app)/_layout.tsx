import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { BlurView } from "expo-blur";
import { Tabs, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";

import OnboardingModal from "@/components/OnboardingModal/OnboardingModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
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
          tabBarActiveTintColor: setLightOrDark(COLORS.zinc[950], COLORS.sky[500]),
          tabBarInactiveTintColor: setLightOrDark(COLORS.zinc[500], COLORS.zinc[400]),
          tabBarStyle: s.tabBarStyle,
          headerShadowVisible: false, // applied here
          tabBarBackground: () => {
            // only show blur view on ios
            if (Platform.OS === "ios") {
              return (
                <BlurView
                  style={{
                    flex: 1,
                    backgroundColor: setLightOrDark("#fafafaCC", "#000000CC"),
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
            tabBarIcon: ({ color, focused }) => <FontAwesome5 name="square-full" size={20} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, focused }) => <Feather name="search" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add Post",
            tabBarIcon: ({ color, focused }) => <Octicons name="diff-added" size={24} color={color} />,
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        />
        <Tabs.Screen
          name="posts"
          options={{
            title: "Posts",
            tabBarIcon: ({ color, focused }) => <MaterialIcons name="grid-on" size={24} color={color} />,
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
            tabBarIcon: ({ color, focused }) => <MaterialIcons name="person" size={24} color={color} />,
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
    <PostsContextProvider>
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
    </PostsContextProvider>
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
