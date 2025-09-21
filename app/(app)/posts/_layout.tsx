import { Stack } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowersContext } from "@/context/AuthProfileFollowersContext";
import { useAuthProfileFollowingContext } from "@/context/AuthProfileFollowingContext";
import { useColorMode } from "@/context/ColorModeContext";

const PostsStack = () => {
  const { isDarkMode } = useColorMode();
  const followingCtx = useAuthProfileFollowingContext();
  const followersCtx = useAuthProfileFollowersContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
        headerTintColor: isDarkMode ? COLORS.zinc[50] : COLORS.zinc[950],
        contentStyle: {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Posts" }} />
      <Stack.Screen name="list" options={{ title: "Posts", headerBackTitle: "My Posts" }} />
      <Stack.Screen
        name="followers"
        options={{
          title: "Followers",
          headerBackTitleVisible: false,
          headerTitle: () => {
            return (
              <View style={{ flexGrow: 1 }}>
                <TextInput
                  inputStyle={[s.modalSearchInput, { width: Platform.OS === "ios" ? "80%" : "70%" }]}
                  returnKeyType="search"
                  value={followersCtx.searchText}
                  onChangeText={(text) => followersCtx.setSearchText(text)}
                  onSubmitEditing={followersCtx.searchProfiles}
                  placeholder="Search followers..."
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          title: "Following",
          headerBackTitleVisible: false,
          headerTitle: () => {
            return (
              <View style={{ flexGrow: 1 }}>
                <TextInput
                  inputStyle={[s.modalSearchInput, { width: Platform.OS === "ios" ? "80%" : "70%" }]}
                  returnKeyType="search"
                  value={followingCtx.searchText}
                  onChangeText={(text) => followingCtx.setSearchText(text)}
                  onSubmitEditing={followingCtx.searchProfiles}
                  placeholder="Search following..."
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen name="savedPosts" options={{ title: "Saved", headerBackTitleVisible: false }} />
      <Stack.Screen name="savedPostsList" options={{ title: "Saved", headerBackTitleVisible: false }} />
      <Stack.Screen name="profileDetails" options={{ title: "Profile Details" }} />
      <Stack.Screen name="profilePostsList" options={{ title: "Posts" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
    </Stack>
  );
};

export default PostsStack;

const s = StyleSheet.create({
  modalSearchInput: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 16,
    height: 35,
    marginTop: Platform.OS === "android" ? 4 : 0,
  },
});
