import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useEffect } from "react";
import { useRef } from "react";
import { StyleSheet } from "react-native";

import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import { SentFollowRequestWithStatus as TSentFollowRequestWithStatus } from "@/types/follow-requests/follow-requests";

import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import SentFollowRequest from "../SentFollowRequest/SentFollowRequest";

import ListEmptyComponent from "./components/ListEmptyComponent";

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
      onEndReachedThreshold={0.4}
      onRefresh={query.refetch}
      refreshing={query.isRefetching}
      contentContainerStyle={{ ...s.container, paddingBottom: tabBarHeight + 16 }}
      renderItem={({ item }) => <SentFollowRequest item={item} cancelRequest={handleCancelRequest} />}
      onEndReached={handleEndReached}
      ListEmptyComponent={
        <ListEmptyComponent isLoading={query.isLoading} isError={query.isError} refetch={query.refetch} />
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
