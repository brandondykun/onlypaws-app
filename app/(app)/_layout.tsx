import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs, Redirect } from "expo-router";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import PostsContextProvider from "@/context/PostsContext";

const TabLayout = () => {
  const { isDarkMode, setLightOrDark } = useColorMode();

  const { authLoading, isAuthenticated } = useAuthUserContext();

  if (authLoading) {
    return (
      <View style={[s.loadingView, { backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[100] }]}>
        <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={s.loadingViewText}>
          Loading
        </Text>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/" />;
  }

  return (
    <PostsContextProvider>
      <ExpoStatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
          tabBarInactiveTintColor: isDarkMode ? COLORS.zinc[600] : COLORS.zinc[400],
          tabBarStyle: {
            backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
            borderTopColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
          },
          headerShadowVisible: false, // applied here
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
          }}
        />
        <Tabs.Screen
          name="posts"
          options={{
            title: "Posts",
            tabBarIcon: ({ color, focused }) => <MaterialIcons name="grid-on" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => <MaterialIcons name="person" size={24} color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>
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
});
