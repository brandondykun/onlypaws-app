import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { View, Platform } from "react-native";
import Toast from "react-native-toast-message";

import { followProfile, unfollowProfile } from "@/api/interactions";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import SearchedProfilePreview from "@/components/SearchedProfilePreview/SearchedProfilePreview";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import { useProfileSearchContext } from "@/context/ProfileSearchContext";
import { SearchedProfile } from "@/types";

const ProfileSearchScreen = () => {
  const search = useProfileSearchContext();
  const profileDetailsManager = useProfileDetailsManagerContext();
  const tabBarHeight = useBottomTabBarHeight();

  const handleUnfollowPress = async (profileId: number) => {
    const { error } = await unfollowProfile(profileId);
    if (!error) {
      profileDetailsManager.onUnfollow(profileId);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error unfollowing that account.",
      });
    }
  };

  const handleFollowPress = async (searchedProfile: SearchedProfile) => {
    const { error, data } = await followProfile(searchedProfile.id);
    if (!error && data) {
      profileDetailsManager.onFollow(searchedProfile.id);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error following that account.",
      });
    }
  };

  let content = (
    <View style={{ flex: 1, alignItems: "center", paddingTop: Platform.OS === "android" ? 0 : 30 }}>
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
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
      <FlashList
        contentContainerStyle={{ paddingBottom: tabBarHeight, paddingTop: Platform.OS === "android" ? 0 : 24 }}
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
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        onEndReached={!search.fetchNextLoading ? () => search.fetchNext() : null} // prevent from being called twice
        ListFooterComponent={search.fetchNextLoading ? <LoadingFooter /> : null}
      />
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

export default ProfileSearchScreen;
