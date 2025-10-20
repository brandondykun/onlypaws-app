import { Stack } from "expo-router";
import { View } from "react-native";

import HeaderSearchInput from "@/components/HeaderSearchInput/HeaderSearchInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowersContext } from "@/context/AuthProfileFollowersContext";
import { useAuthProfileFollowingContext } from "@/context/AuthProfileFollowingContext";
import { useColorMode } from "@/context/ColorModeContext";

const PostsStack = () => {
  const { setLightOrDark } = useColorMode();
  const followingCtx = useAuthProfileFollowingContext();
  const followersCtx = useAuthProfileFollowersContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]) },
        headerTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
        contentStyle: { backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]) },
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
            return (
              <View style={{ flexGrow: 1 }}>
                <HeaderSearchInput
                  value={followersCtx.searchText}
                  onChangeText={(text) => followersCtx.setSearchText(text)}
                  onSubmitEditing={followersCtx.searchProfiles}
                  placeholder="Search followers..."
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
          headerBackButtonDisplayMode: "minimal",
          headerTitle: () => {
            return (
              <View style={{ flexGrow: 1 }}>
                <HeaderSearchInput
                  value={followingCtx.searchText}
                  onChangeText={(text) => followingCtx.setSearchText(text)}
                  onSubmitEditing={followingCtx.searchProfiles}
                  placeholder="Search following..."
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen name="savedPosts" options={{ title: "Saved", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="savedPostsList" options={{ title: "Saved", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="profileDetails" options={{ title: "Profile Details" }} />
      <Stack.Screen name="profilePostsList" options={{ title: "Posts" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="editPost" options={{ title: "Edit Post" }} />
      <Stack.Screen name="postDetails" options={{ title: "Post Details" }} />
      <Stack.Screen name="commentDetails" options={{ title: "Comment Details" }} />
    </Stack>
  );
};

export default PostsStack;
