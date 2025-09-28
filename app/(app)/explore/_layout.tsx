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
        headerStyle: {
          backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
        },
        headerTintColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
        contentStyle: {
          backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
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
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="profileList" options={{ title: "Posts" }} />
    </Stack>
  );
};

export default ExploreStack;
