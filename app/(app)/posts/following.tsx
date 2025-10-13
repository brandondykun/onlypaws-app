import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, RefreshControl, StyleSheet, Platform, Pressable } from "react-native";

import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowingContext } from "@/context/AuthProfileFollowingContext";
import { usePostsProfileDetailsContext } from "@/context/PostsProfileDetailsContext";

const FollowingScreen = () => {
  const { setProfileId } = usePostsProfileDetailsContext();
  const followingCtx = useAuthProfileFollowingContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="large" />
    </View>
  );

  const emptyComponent =
    followingCtx.searchResults?.length === 0 ? (
      <View style={{ marginTop: 48 }}>
        <Text
          style={{ textAlign: "center", fontSize: 20, fontWeight: "300" }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          No results found
        </Text>
      </View>
    ) : (
      <View style={s.emptyComponent}>
        <Text style={s.emptyComponentMainText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          You are not following any profiles.
        </Text>
        <Text style={s.emptyComponentSubText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
          Get out there and find some profiles to follow!
        </Text>
      </View>
    );

  if (followingCtx.initialFetchComplete && !followingCtx.searchLoading) {
    const dataToRender = followingCtx.searchResults ? followingCtx.searchResults : followingCtx.data;
    const onEndReached =
      !followingCtx.fetchNextLoading && !followingCtx.hasFetchNextError && !followingCtx.hasInitialFetchError
        ? () => followingCtx.fetchNext()
        : null;
    const searchOnEndReached =
      !followingCtx.searchFetchNextLoading && !followingCtx.hasSearchFetchNextError
        ? () => followingCtx.fetchSearchNext()
        : null;

    content = (
      <FlashList
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
        refreshing={followingCtx.refreshing}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        onEndReachedThreshold={0.3} // Trigger when 30%
        onEndReached={followingCtx.searchResults ? searchOnEndReached : onEndReached}
        refreshControl={
          followingCtx.searchResults ? undefined : (
            <RefreshControl
              refreshing={followingCtx.refreshing}
              onRefresh={followingCtx.refetch}
              tintColor={COLORS.zinc[400]}
              colors={[COLORS.zinc[400]]}
            />
          )
        }
        renderItem={({ item: profile }) => (
          <Pressable
            onPress={() => {
              setProfileId(profile.id);
              router.push({ pathname: "/(app)/posts/profileDetails", params: { profileId: profile.id } });
            }}
          >
            <FollowListProfile profile={profile} />
          </Pressable>
        )}
        ListFooterComponent={
          followingCtx.fetchNextLoading || followingCtx.searchFetchNextLoading ? <LoadingFooter /> : null
        }
      />
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

export default FollowingScreen;

const s = StyleSheet.create({
  modalSearchInput: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 16,
    height: 35,
    marginTop: Platform.OS === "android" ? 4 : -3,
  },
  emptyComponent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginTop: 48,
  },
  emptyComponentMainText: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 36,
    fontWeight: "300",
  },
  emptyComponentSubText: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 36,
    fontWeight: "300",
  },
});
