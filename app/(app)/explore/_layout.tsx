import { Stack } from "expo-router";
import { StyleSheet, View, Platform } from "react-native";

import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useProfileSearchContext } from "@/context/ProfileSearchContext";

const platform = Platform.OS;

const ExploreStack = () => {
  const { isDarkMode } = useColorMode();
  const search = useProfileSearchContext();

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
      <Stack.Screen name="index" options={{ title: "Explore" }} />
      <Stack.Screen
        name="profileSearch"
        options={{
          title: "Search",
          headerBackTitleVisible: false,
          headerTitle: () => {
            return (
              <View style={{ flexGrow: 1 }}>
                <TextInput
                  inputStyle={[s.modalSearchInput, { width: Platform.OS === "ios" ? "80%" : "70%" }]}
                  returnKeyType="search"
                  value={search.searchText}
                  onChangeText={search.setSearchText}
                  onSubmitEditing={search.search}
                  placeholder="Search profiles..."
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen name="list" options={{ title: "Posts" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="profileList" options={{ title: "Posts" }} />
    </Stack>
  );
};

export default ExploreStack;

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
