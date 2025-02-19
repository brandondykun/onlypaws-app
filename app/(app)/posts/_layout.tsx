import { Stack } from "expo-router";
import { Dimensions, Platform, StyleSheet, View, Text } from "react-native";

import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowersContext } from "@/context/AuthProfileFollowersContext";
import { useAuthProfileFollowingContext } from "@/context/AuthProfileFollowingContext";
import { useColorMode } from "@/context/ColorModeContext";

const platform = Platform.OS;

const PostsStack = () => {
  const { isDarkMode } = useColorMode();
  const followingCtx = useAuthProfileFollowingContext();
  const followersCtx = useAuthProfileFollowersContext();

  const screenWidth = Dimensions.get("window").width;

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
          headerBackButtonDisplayMode: "minimal",
          headerTitle: () => {
            if (Platform.OS === "ios") {
              return (
                <View style={{ flex: 1 }}>
                  <TextInput
                    inputStyle={[s.modalSearchInput, { width: screenWidth - 98 }]}
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
            } else {
              return <Text style={{ fontSize: 20, fontWeight: "500" }}>Followers</Text>;
            }
          },
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          title: "Following",
          headerBackButtonDisplayMode: "minimal",
          headerTitle: () => {
            if (Platform.OS === "ios") {
              return (
                <View style={{ flex: 1 }}>
                  <TextInput
                    inputStyle={[s.modalSearchInput, { width: screenWidth - 98 }]}
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
            } else {
              return <Text style={{ fontSize: 20, fontWeight: "500" }}>Following</Text>;
            }
          },
        }}
      />
      <Stack.Screen name="savedPosts" options={{ title: "Saved", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="savedPostsList" options={{ title: "Saved", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="profileDetails" options={{ title: "Profile Details" }} />
      <Stack.Screen name="profilePostsList" options={{ title: "Posts" }} />
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
    marginTop: platform === "android" ? 4 : 0,
  },
});
