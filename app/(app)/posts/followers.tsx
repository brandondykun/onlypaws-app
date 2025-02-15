import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, RefreshControl, StyleSheet, Platform, Pressable } from "react-native";

import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowersContext } from "@/context/AuthProfileFollowersContext";
import { usePostsProfileDetailsContext } from "@/context/PostsProfileDetailsContext";

const platform = Platform.OS;

const FollowersScreen = () => {
  const { setProfileId } = usePostsProfileDetailsContext();
  const followersCtx = useAuthProfileFollowersContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="large" />
    </View>
  );

  const emptyComponent =
    followersCtx.searchResults?.length === 0 ? (
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
          You don't have any followers yet.
        </Text>
        <Text style={s.emptyComponentSubText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
          Keep posting great content to gain some followers!
        </Text>
      </View>
    );

  if (followersCtx.initialFetchComplete && !followersCtx.searchLoading) {
    const dataToRender = followersCtx.searchResults ? followersCtx.searchResults : followersCtx.data;
    const onEndReached =
      !followersCtx.fetchNextLoading && !followersCtx.hasFetchNextError && !followersCtx.hasInitialFetchError
        ? () => followersCtx.fetchNext()
        : null;
    const searchOnEndReached =
      !followersCtx.searchFetchNextLoading && !followersCtx.hasSearchFetchNextError
        ? () => followersCtx.fetchSearchNext()
        : null;

    content = (
      <FlashList
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        refreshing={followersCtx.refreshing}
        estimatedItemSize={62}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        onEndReachedThreshold={0.3} // Trigger when 30%
        onEndReached={followersCtx.searchResults ? searchOnEndReached : onEndReached}
        refreshControl={
          followersCtx.searchResults ? undefined : (
            <RefreshControl
              refreshing={followersCtx.refreshing}
              onRefresh={followersCtx.refetch}
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
          followersCtx.fetchNextLoading || followersCtx.searchFetchNextLoading ? (
            <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 12 }}>
              <ActivityIndicator color={COLORS.zinc[500]} size="large" />
            </View>
          ) : null
        }
      />
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

export default FollowersScreen;

const s = StyleSheet.create({
  modalSearchInput: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 16,
    height: 35,
    marginTop: platform === "android" ? 4 : -3,
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
