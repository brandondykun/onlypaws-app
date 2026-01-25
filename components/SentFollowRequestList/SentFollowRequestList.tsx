import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useEffect } from "react";
import { useRef } from "react";
import { RefreshControl, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import { SentFollowRequestWithStatus as TSentFollowRequestWithStatus } from "@/types/follow-requests/follow-requests";

import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "../ListEmptyComponent/ListEmptyComponent";
import SentFollowRequest from "../SentFollowRequest/SentFollowRequest";

const SentFollowRequestList = () => {
  const { sentRequests, cancelRequest, sentRequestsQuery: query } = useFollowRequestsContext();
  const tabBarHeight = useBottomTabBarHeight();
  const { cancelFollowRequest } = useProfileDetailsManagerContext();
  const flashListRef = useRef<FlashListRef<TSentFollowRequestWithStatus>>(null);

  useEffect(() => {
    if (flashListRef.current) {
      flashListRef.current?.scrollToTop({ animated: true });
    }
  }, [sentRequests]);

  const handleEndReached = () => {
    const hasErrors = query.isError || query.isFetchNextPageError;
    const isLoading = query.isLoading || query.isFetchingNextPage;

    if (query.hasNextPage && !hasErrors && !isLoading) {
      query.fetchNextPage();
    }
  };

  const handleCancelRequest = async (profileId: number) => {
    await cancelRequest(profileId);
    cancelFollowRequest(profileId);
  };

  return (
    <FlashList
      ref={flashListRef}
      data={sentRequests}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.3}
      onRefresh={query.refetch}
      refreshing={query.isRefetching}
      contentContainerStyle={{ ...s.container, paddingBottom: tabBarHeight + 16 }}
      renderItem={({ item }) => <SentFollowRequest item={item} cancelRequest={handleCancelRequest} />}
      onEndReached={handleEndReached}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching && !query.isFetchingNextPage}
          onRefresh={query.refetch}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
        />
      }
      ListEmptyComponent={
        <ListEmptyComponent
          isLoading={query.isLoading}
          isError={query.isError}
          isRefetching={query.isRefetching}
          emptyMessage="No sent follow requests"
        />
      }
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={query.isFetchingNextPage}
          isError={query.isFetchNextPageError}
          fetchNextPage={query.fetchNextPage}
          message="Oh no! There was an error fetching more follow requests!"
        />
      }
    />
  );
};

export default SentFollowRequestList;

const s = StyleSheet.create({
  container: {
    paddingTop: 16,
    flexGrow: 1,
  },
});
