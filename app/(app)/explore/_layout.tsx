import { Stack } from "expo-router";
import { View } from "react-native";

import HeaderSearchInput from "@/components/HeaderSearchInput/HeaderSearchInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useProfileSearchContext } from "@/context/ProfileSearchContext";

const ExploreStack = () => {
  const search = useProfileSearchContext();
  const { setLightOrDark } = useColorMode();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
        headerTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[200]),
        contentStyle: { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Explore" }} />
      <Stack.Screen
        name="profileSearch"
        options={{
          title: "Search",
          headerTitle: () => {
            return (
              <View style={{ width: "100%", alignItems: "center" }}>
                <HeaderSearchInput
                  value={search.searchText}
                  onChangeText={search.setSearchText}
                  onSubmitEditing={search.search}
                  placeholder="Search profiles..."
                />
              </View>
            );
          },
        }}
      />
      <Stack.Screen name="list" options={{ title: "Posts" }} />
      <Stack.Screen name="profileDetails" options={{ title: "Profile" }} />
      <Stack.Screen name="profilePostsList" options={{ title: "Posts" }} />
      <Stack.Screen name="taggedPosts" options={{ title: "Tagged Posts" }} />
      <Stack.Screen name="taggedPostsList" options={{ title: "Tagged Posts" }} />
    </Stack>
  );
};

export default ExploreStack;
