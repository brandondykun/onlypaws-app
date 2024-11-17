import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useState, useCallback, useEffect } from "react";
import { View, ActivityIndicator, RefreshControl } from "react-native";

import { axiosFetch } from "@/api/config";
import { getFollowing } from "@/api/profile";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { PaginatedProfileResponse, FollowProfile } from "@/types";

const FollowingScreen = () => {
  const { authProfile } = useAuthProfileContext();
  const [data, setData] = useState<FollowProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const fetchFollowing = useCallback(async () => {
    if (authProfile.id) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { data: feedData, error } = await getFollowing(authProfile.id);
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
    fetchFollowing();
  }, [fetchFollowing, authProfile]);

  // refresh following fetch if user swipes down
  const refreshFollowing = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchFollowing();
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

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="large" />
    </View>
  );

  const emptyComponent = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 24, marginTop: 48 }}>
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
        You not following any profiles.
      </Text>
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          paddingHorizontal: 36,
          fontWeight: "300",
        }}
        darkColor={COLORS.zinc[500]}
        lightColor={COLORS.zinc[500]}
      >
        Get out there and find some profiles to follow!
      </Text>
    </View>
  );

  if (initialFetchComplete) {
    content = (
      <FlashList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        refreshing={refreshing}
        estimatedItemSize={62}
        onEndReachedThreshold={0.3} // Trigger when 30%
        onEndReached={!fetchNextLoading && !hasFetchNextError && !hasInitialFetchError ? () => fetchNext() : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFollowing}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        renderItem={({ item: profile }) => <FollowListProfile profile={profile} />}
        ListFooterComponent={
          fetchNextLoading ? (
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

export default FollowingScreen;
