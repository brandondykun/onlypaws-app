import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useEffect, useRef } from "react";
import { RefreshControl, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { FollowRequestWithStatus } from "@/types/follow-requests/follow-requests";

import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "../ListEmptyComponent/ListEmptyComponent";
import ReceivedFollowRequest from "../ReceivedFollowRequest/ReceivedFollowRequest";

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
      onEndReachedThreshold={0.3}
      onRefresh={query.refetch}
      refreshing={query.isRefetching}
      contentContainerStyle={{ ...s.container, paddingBottom: tabBarHeight + 16 }}
      onEndReached={handleEndReached}
      renderItem={({ item }) => (
        <ReceivedFollowRequest item={item} acceptRequest={acceptRequest} declineRequest={declineRequest} />
      )}
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
          emptyMessage="No received follow requests"
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

export default ReceivedFollowRequestList;

const s = StyleSheet.create({
  container: {
    paddingTop: 16,
    flexGrow: 1,
  },
});
