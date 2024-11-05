import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { followProfile, unfollowProfile } from "@/api/profile";
import SearchedProfilePreview from "@/components/SearchedProfilePreview/SearchedProfilePreview";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useProfileSearchContext } from "@/context/ProfileSearchContext";
import { SearchedProfile } from "@/types";

const ProfileSearchScreen = () => {
  const navigation = useNavigation();
  const search = useProfileSearchContext();
  const { authProfile } = useAuthProfileContext();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerTitle: () => (
        <View style={{ flex: 1, paddingRight: 75 }}>
          <TextInput
            inputStyle={s.modalSearchInput}
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
      ),
    });
  });

  const handleUnfollowPress = async (profileId: number) => {
    const { error } = await unfollowProfile(profileId, authProfile.id);
    if (!error) {
      search.onUnfollow(profileId);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error unfollowing that account.",
      });
    }
  };

  const handleFollowPress = async (searchedProfile: SearchedProfile) => {
    const { error, data } = await followProfile(searchedProfile.id, authProfile.id);
    if (!error && data) {
      search.onFollow(searchedProfile);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error following that account.",
      });
    }
  };

  let content = (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 30 }}>
      <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.zinc[500] }}>
        Enter a username to search.
      </Text>
    </View>
  );

  if (search.hasInitialFetchError) {
    content = (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error with that search. Swipe down to try again.
        </Text>
      </View>
    );
  }

  const emptyComponent = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          paddingHorizontal: 36,
          fontWeight: "300",
        }}
        darkColor={COLORS.zinc[400]}
        lightColor={COLORS.zinc[600]}
      >
        No profiles found with that username.
      </Text>
    </View>
  );

  if (search.initialFetchComplete) {
    content = (
      <FlatList
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        data={search.data}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: profile, index }) => (
          <SearchedProfilePreview
            profile={profile}
            handleFollowPress={handleFollowPress}
            handleUnfollowPress={handleUnfollowPress}
            key={profile.id}
          />
        )}
        onEndReachedThreshold={0.1} // Trigger when 20% from the bottom
        onEndReached={!search.fetchNextLoading ? () => search.fetchNext() : null} // prevent from being called twice
        ListFooterComponent={
          search.fetchNextLoading ? (
            <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>
              <ActivityIndicator color={COLORS.zinc[500]} size="small" />
            </View>
          ) : null
        }
      />
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

export default ProfileSearchScreen;

const s = StyleSheet.create({
  modalSearchInput: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 16,
    height: 35,
  },
});
