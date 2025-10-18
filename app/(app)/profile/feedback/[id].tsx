import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native";

import { getFeedbackTicket } from "@/api/feedback";
import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import FeedbackCard from "@/components/Feedback/FeedbackCard/FeedbackCard";
import FeedbackComment from "@/components/Feedback/FeedbackComment/FeedbackComment";
import FeedbackTypeBubble from "@/components/Feedback/FeedbackTypeBubble/FeedbackTypeBubble";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { FeedbackTicketDetailed } from "@/types/feedback/feedback";

const FeedbackDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();

  const [data, setData] = useState<FeedbackTicketDetailed | null>(null);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await getFeedbackTicket(id);
      if (data && !error) {
        setData(data);
      } else {
        setHasInitialFetchError(true);
      }
    } catch {
      setHasInitialFetchError(true);
    } finally {
      setInitialFetchComplete(true);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // default to loading state
  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="small" />
    </View>
  );

  // initial fetch error state
  if (initialFetchComplete && hasInitialFetchError) {
    content = (
      <ErrorMessageWithRefresh refresh={fetchData} errorText="There was an error fetching your feedback details" />
    );
  }

  // initial fetch complete and data state
  if (initialFetchComplete && !hasInitialFetchError && data) {
    const createdAt = data?.created_at ? new Date(data?.created_at) : null;
    const commentsCount = parseInt(data?.comments_count);
    content = (
      <View>
        <FeedbackCard style={{ marginBottom: 28 }}>
          <Text numberOfLines={1} style={s.titleText}>
            {data.title}
          </Text>
          <View style={s.feedbackTypeContainer}>
            <FeedbackTypeBubble ticketType={data.ticket_type} />
          </View>
          <Text style={s.description} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]}>
            {data.description}
          </Text>
          <Text style={s.dateText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            Submitted on{" "}
            {createdAt
              ? createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </Text>
        </FeedbackCard>
        <View style={s.commentsHeader}>
          <Text style={s.commentsHeaderText}>Developer Comments</Text>
          {commentsCount ? (
            <Text style={s.commentsCount} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              {data?.comments_count} {parseInt(data?.comments_count) === 1 ? "comment" : "comments"}
            </Text>
          ) : null}
        </View>
        <View>
          {data?.comments && data?.comments.length > 0 ? (
            data?.comments.map((comment) => {
              return <FeedbackComment key={comment.id} comment={comment} />;
            })
          ) : (
            <Text style={s.noCommentsText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              There are no comments on this feedback yet. Check back soon to see if there are any updates from the
              OnlyPaws Dev Team.
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}>
      <View style={{ flexGrow: 1 }}>{content}</View>
    </ScrollView>
  );
};

export default FeedbackDetailScreen;

const s = StyleSheet.create({
  scrollView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  feedbackTypeContainer: {
    justifyContent: "flex-start",
    flexDirection: "row",
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
  },
  dateText: {
    fontSize: 15,
  },
  commentsHeader: {
    marginBottom: 18,
    paddingLeft: 4,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  commentsHeaderText: {
    fontSize: 20,
    fontWeight: "700",
  },
  commentsCount: {
    fontSize: 16,
    fontWeight: "500",
  },
  noCommentsText: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
});
