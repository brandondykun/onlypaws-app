import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useLayoutEffect, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { ScrollView } from "react-native";

import { getFeedbackTickets } from "@/api/feedback";
import Button from "@/components/Button/Button";
import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import FeedbackListItem from "@/components/Feedback/FeedbackListItem/FeedbackListItem";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { FeedbackTicket } from "@/types";

const FeedbackScreen = () => {
  const { authProfile } = useAuthProfileContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { setLightOrDark } = useColorMode();

  // will be true when the user navigates back to this screen after creating a feedback ticket
  const { shouldRefresh } = useLocalSearchParams<{ shouldRefresh?: "true" | "false" }>();

  const initialFetch = useCallback(async () => {
    const { data, error } = await getFeedbackTickets();
    return { data, error };
  }, []);

  const {
    data,
    refresh,
    refreshing,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
  } = usePaginatedFetch<FeedbackTicket>(initialFetch, {
    onRefresh: () => Haptics.impactAsync(),
    enabled: !!authProfile?.id,
  });

  useEffect(() => {
    if (shouldRefresh === "true") {
      refresh();
    }
  }, [shouldRefresh, refresh]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          text="Create"
          variant="text"
          onPress={() => router.push("/(app)/profile/feedback/createFeedback")}
          textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
        />
      ),
    });
  });

  // default to loading state
  let content = <ActivityIndicator />;

  // initial fetch error state
  if (initialFetchComplete && hasInitialFetchError) {
    content = (
      <ErrorMessageWithRefresh refresh={refresh} errorText="There was an error fetching your feedback tickets" />
    );
  }

  const emptyComponent = (
    <View style={s.emptyComponentContainer}>
      <Text style={s.emptyComponentTitle}>No feedback tickets found</Text>
      <Text style={s.emptyComponentDescription} darkColor={COLORS.zinc[400]}>
        Use the "Create" button to send feedback to the team.
      </Text>
    </View>
  );

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <LoadingFooter />
  ) : hasFetchNextError ? (
    <RetryFetchFooter
      fetchFn={fetchNext}
      message="Oh no! There was an error fetching more feedback tickets!"
      buttonText="Retry"
    />
  ) : null;

  // initial fetch complete and data state
  if (initialFetchComplete && !hasInitialFetchError) {
    content = (
      <View>
        <FlashList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={62}
          ListEmptyComponent={emptyComponent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
          onEndReached={!fetchNextLoading && !hasFetchNextError && !hasInitialFetchError ? () => fetchNext() : null}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={COLORS.zinc[400]}
              colors={[COLORS.zinc[400]]}
            />
          }
          renderItem={({ item }) => <FeedbackListItem item={item} />}
          ListFooterComponent={footerComponent}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ flexGrow: 1 }}>{content}</View>
    </ScrollView>
  );
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
