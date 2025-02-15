import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import { debounce } from "lodash";
import { useState, useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { View, ActivityIndicator, RefreshControl, StyleSheet, Dimensions, Platform, Pressable } from "react-native";

import { axiosFetch } from "@/api/config";
import { getFollowers, searchFollowers } from "@/api/profile";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { usePostsProfileDetailsContext } from "@/context/PostsProfileDetailsContext";
import { PaginatedProfileResponse, FollowProfile } from "@/types";

const platform = Platform.OS;

const FollowersScreen = () => {
  const { authProfile } = useAuthProfileContext();
  const [data, setData] = useState<FollowProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFetchNextUrl, setSearchFetchNextUrl] = useState<string | null>(null);
  const [searchFetchNextLoading, setSearchFetchNextLoading] = useState(false);
  const [hasSearchFetchNextError, setHasSearchFetchNextError] = useState(false);
  const [searchResults, setSearchResults] = useState<FollowProfile[] | null>(null);

  const { setProfileId } = usePostsProfileDetailsContext();
  const navigation = useNavigation();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const tabBarHeight = useBottomTabBarHeight();

  const fetchFollowers = useCallback(async () => {
    if (authProfile.id) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { data: feedData, error } = await getFollowers(authProfile.id);
      if (feedData && !error) {
        setData(feedData.results);
        setFetchNextUrl(feedData.next);
      } else {
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
      setRefreshing(false);
    }
  }, [authProfile]);

  useEffect(() => {
    setFetchNextUrl(null);
    fetchFollowers();
  }, [fetchFollowers, authProfile]);

  // refresh followers fetch if user swipes down
  const refreshFollowers = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchFollowers();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedProfileResponse>(fetchNextUrl);
      if (!error && fetchNextData) {
        setData((prev) => [...prev, ...fetchNextData.results]);
        setFetchNextUrl(fetchNextData.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl]);

  const fetchSearchNext = useCallback(async () => {
    if (searchFetchNextUrl) {
      setSearchFetchNextLoading(true);
      setHasSearchFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedProfileResponse>(searchFetchNextUrl);
      if (!error && fetchNextData) {
        setSearchResults((prev) => [...prev!, ...fetchNextData.results]);
        setSearchFetchNextUrl(fetchNextData.next);
      } else {
        setHasSearchFetchNextError(true);
      }
      setSearchFetchNextLoading(false);
    }
  }, [searchFetchNextUrl]);

  const debounceSearch = useMemo(
    () =>
      debounce(async (text: string) => {
        if (text) {
          setSearchLoading(true);
          const { error, data } = await searchFollowers(authProfile.id, text);
          if (!error && data) {
            setSearchResults(data.results);
            setSearchFetchNextUrl(data.next);
          }
          setSearchLoading(false);
        }
      }, 1000),
    [authProfile.id],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flex: 1 }}>
          <TextInput
            inputStyle={[s.modalSearchInput, { width: screenWidth - 98 }]}
            returnKeyType="search"
            editable={!!data.length}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              debounceSearch(text);
              if (!text) {
                setSearchResults(null);
              }
            }}
            placeholder="Search followers..."
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ),
    });
  });

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="large" />
    </View>
  );

  const emptyComponent =
    searchResults?.length === 0 ? (
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

  if (initialFetchComplete && !searchLoading) {
    const dataToRender = searchResults ? searchResults : data;
    const onEndReached = !fetchNextLoading && !hasFetchNextError && !hasInitialFetchError ? () => fetchNext() : null;
    const searchOnEndReached = !searchFetchNextLoading && !hasSearchFetchNextError ? () => fetchSearchNext() : null;

    content = (
      <FlashList
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        refreshing={refreshing}
        estimatedItemSize={62}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        onEndReachedThreshold={0.3} // Trigger when 30%
        onEndReached={searchResults ? searchOnEndReached : onEndReached}
        refreshControl={
          searchResults ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshFollowers}
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
          fetchNextLoading || searchFetchNextLoading ? (
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
