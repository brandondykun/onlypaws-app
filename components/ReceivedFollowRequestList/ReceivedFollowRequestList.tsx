import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { FollowRequestWithStatus } from "@/types/follow-requests/follow-requests";

import ReceivedFollowRequest from "../ReceivedFollowRequest/ReceivedFollowRequest";

import ListEmptyComponent from "./components/ListEmptyComponent";
import ListFooterComponent from "./components/ListFooterComponent";

const ReceivedFollowRequestList = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { receivedRequestsQuery: query, receivedRequests, acceptRequest, declineRequest } = useFollowRequestsContext();
  const flashListRef = useRef<FlashListRef<FollowRequestWithStatus>>(null);

  useEffect(() => {
    if (flashListRef.current) {
      flashListRef.current?.scrollToTop({ animated: true });
    }
  }, [receivedRequests]);

  const handleEndReached = () => {
    const hasErrors = query.isError || query.isFetchNextPageError;
    const isLoading = query.isLoading || query.isFetchingNextPage;

    if (query.hasNextPage && !hasErrors && !isLoading) {
      query.fetchNextPage();
    }
  };

  return (
    <FlashList
      ref={flashListRef}
      data={receivedRequests}
      extraData={receivedRequests}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.4}
      onRefresh={query.refetch}
      refreshing={query.isRefetching}
      contentContainerStyle={{ ...s.container, paddingBottom: tabBarHeight + 16 }}
      onEndReached={handleEndReached}
      renderItem={({ item }) => (
        <ReceivedFollowRequest item={item} acceptRequest={acceptRequest} declineRequest={declineRequest} />
      )}
      ListEmptyComponent={
        <ListEmptyComponent isLoading={query.isLoading} isError={query.isError} refetch={query.refetch} />
      }
      ListFooterComponent={
        <ListFooterComponent
          isFetchingNextPage={query.isFetchingNextPage}
          isFetchNextPageError={query.isFetchNextPageError}
          fetchNextPage={query.fetchNextPage}
        />
      }
    />
  );
};

export default ReceivedFollowRequestList;

const s = StyleSheet.create({
  container: {
    paddingTop: 16,
    flexGrow: 1,
  },
});
