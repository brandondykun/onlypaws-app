import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";

import { getPostReportsForQuery } from "@/api/report";
import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostReport } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.amber[500],
  UNDER_REVIEW: COLORS.sky[500],
  RESOLVED: COLORS.lime[500],
  DISMISSED: COLORS.zinc[500],
};

const ReportItem = ({ item }: { item: PostReport }) => {
  const { setLightOrDark } = useColorMode();
  const router = useRouter();
  const createdAt = new Date(item.created_at);

  return (
    <Pressable
      onPress={() => router.push(`/profile/postReports/${item.id}`)}
      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
    >
      <View style={[s.reportCard, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]}>
        <View style={s.reportHeader}>
          <Text style={s.postLabel} numberOfLines={1}>
            {item.post_profile_username}&apos;s Post
          </Text>
          <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
            <Text style={[s.statusText, { color: STATUS_COLORS[item.status] }]}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>
        <Text style={s.reasonText} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]}>
          {item.reason.name}
        </Text>
        {item.details ? (
          <Text numberOfLines={2} style={s.detailsText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            {item.details}
          </Text>
        ) : null}
        <Text style={s.dateText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
          {createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    </Pressable>
  );
};

const PostReportsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();

  const fetchReports = async ({ pageParam }: { pageParam: string }) => {
    const res = await getPostReportsForQuery(pageParam);
    return res.data;
  };

  const reports = useInfiniteQuery({
    queryKey: queryKeys.postReports.root,
    queryFn: fetchReports,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
  });

  const dataToRender = useMemo(() => {
    return reports.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [reports.data]);

  const handleEndReached = () => {
    const hasErrors = reports.isError || reports.isFetchNextPageError;
    const isLoading = reports.isLoading || reports.isFetchingNextPage;

    if (reports.hasNextPage && !hasErrors && !isLoading) {
      reports.fetchNextPage();
    }
  };

  if (reports.isLoading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  }

  if (!reports.isLoading && reports.isError) {
    return <ErrorMessageWithRefresh refresh={reports.refetch} errorText="There was an error fetching your reports" />;
  }

  return (
    <FlashList
      data={dataToRender}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 32, paddingTop: 16, paddingHorizontal: 16, flexGrow: 1 }}
      refreshing={reports.isRefetching}
      refreshControl={
        <RefreshControl
          refreshing={reports.isRefetching}
          onRefresh={reports.refetch}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
        />
      }
      renderItem={({ item }) => <ReportItem item={item} />}
      ListEmptyComponent={
        <View style={s.emptyContainer}>
          <Text style={s.emptyTitle}>You have not reported anything</Text>
          <Text style={s.emptyDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            Reports you submit on posts will appear here.
          </Text>
        </View>
      }
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={reports.isFetchingNextPage}
          isError={reports.isFetchNextPageError}
          fetchNextPage={reports.fetchNextPage}
          message="There was an error fetching more reports."
        />
      }
    />
  );
};

export default PostReportsScreen;

const s = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 62,
  },
  reportCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  postLabel: {
    fontSize: 18,
    fontWeight: "600",
    flexShrink: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reasonText: {
    fontSize: 16,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBottom: 62,
  },
  emptyTitle: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
  },
});
