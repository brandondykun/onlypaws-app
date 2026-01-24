import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";

import { getFeedbackTicketsForQuery } from "@/api/feedback";
import Button from "@/components/Button/Button";
import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import FeedbackListItem from "@/components/Feedback/FeedbackListItem/FeedbackListItem";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { FeedbackTicket } from "@/types/feedback/feedback";
import { getNextPageParam, minutesToMilliseconds } from "@/utils/utils";

const FeedbackScreen = () => {
  const { selectedProfileId } = useAuthUserContext();
  const { setLightOrDark } = useColorMode();

  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const listRef = useRef<FlashListRef<FeedbackTicket>>(null);
  const prevItemCount = useRef<number | undefined>(undefined);

  const fetchFeedbackTickets = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFeedbackTicketsForQuery(pageParam);
    return res.data;
  };

  const feedbackTickets = useInfiniteQuery({
    queryKey: [selectedProfileId, "feedback-tickets"],
    queryFn: fetchFeedbackTickets,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
    staleTime: minutesToMilliseconds(5),
  });

  // Get total count from first page (API returns total count)
  const totalCount = feedbackTickets.data?.pages[0]?.count;

  // Scroll to top only when a new item is added (count increases)
  useEffect(() => {
    if (prevItemCount.current !== undefined && totalCount !== undefined && totalCount > prevItemCount.current) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
    if (totalCount !== undefined) {
      prevItemCount.current = totalCount;
    }
  }, [totalCount]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          text="Create"
          variant="text"
          onPress={() => router.push("/(app)/profile/feedback/createFeedback")}
          textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
          buttonStyle={{ paddingHorizontal: 8, paddingBottom: 4 }}
        />
      ),
    });
  });

  // default to loading state
  let content = <ActivityIndicator />;

  // initial fetch error state
  if (!feedbackTickets.isLoading && feedbackTickets.isError) {
    content = (
      <ErrorMessageWithRefresh
        refresh={feedbackTickets.refetch}
        errorText="There was an error fetching your feedback tickets"
      />
    );
  }

  // Memoize the flattened feedback tickets data
  const dataToRender = useMemo(() => {
    return feedbackTickets.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [feedbackTickets.data]);

  // initial fetch complete and data state
  if (!feedbackTickets.isLoading && !feedbackTickets.isError) {
    content = (
      <FlashList
        ref={listRef}
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        extraData={feedbackTickets.dataUpdatedAt}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        renderItem={({ item }) => <FeedbackListItem item={item} />}
        contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}
        refreshing={feedbackTickets.isRefetching}
        onEndReached={
          !feedbackTickets.isFetchingNextPage && !feedbackTickets.isFetchNextPageError && !feedbackTickets.isError
            ? () => feedbackTickets.fetchNextPage()
            : null
        }
        refreshControl={
          <RefreshControl
            refreshing={feedbackTickets.isRefetching}
            onRefresh={() => feedbackTickets.refetch()}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        ListEmptyComponent={
          <View style={s.emptyComponentContainer}>
            <Text style={s.emptyComponentTitle}>No feedback tickets found</Text>
            <Text style={s.emptyComponentDescription} darkColor={COLORS.zinc[400]}>
              Use the "Create" button to send feedback to the team.
            </Text>
          </View>
        }
        ListFooterComponent={
          <LoadingRetryFooter
            isLoading={feedbackTickets.isFetchingNextPage}
            isError={feedbackTickets.isFetchNextPageError}
            fetchNextPage={feedbackTickets.fetchNextPage}
            message="Oh no! There was an error fetching more feedback tickets!"
          />
        }
      />
    );
  }

  return <View style={{ flexGrow: 1 }}>{content}</View>;
};

export default FeedbackScreen;

const s = StyleSheet.create({
  scrollView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  emptyComponentContainer: {
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyComponentTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyComponentDescription: {
    fontSize: 16,
    textAlign: "center",
  },
});
