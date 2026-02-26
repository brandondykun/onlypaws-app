import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";

import { getPostReport } from "@/api/report";
import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { minutesToMilliseconds } from "@/utils/utils";

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

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View style={[s.infoRow, { borderBottomColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]) }]}>
      <Text style={s.infoLabel} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        {label}
      </Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
};

const PostReportDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const { setLightOrDark } = useColorMode();

  const fetchReport = async () => {
    const res = await getPostReport(id);
    return res.data;
  };

  const report = useQuery({
    queryKey: queryKeys.postReports.details(id),
    queryFn: fetchReport,
    staleTime: minutesToMilliseconds(5),
  });

  if (report.isLoading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  }

  if (report.isError) {
    return <ErrorMessageWithRefresh refresh={report.refetch} errorText="There was an error fetching report details" />;
  }

  if (!report.data) {
    return (
      <View style={s.centerContainer}>
        <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Report not found
        </Text>
      </View>
    );
  }

  const data = report.data;
  const createdAt = new Date(data.created_at);
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <ScrollView
      contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.headerRow}>
        <Text style={s.headerTitle} numberOfLines={1}>
          {data.post_profile_username}&apos;s Post
        </Text>
        <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[data.status] + "20" }]}>
          <Text style={[s.statusText, { color: STATUS_COLORS[data.status] }]}>
            {STATUS_LABELS[data.status] || data.status}
          </Text>
        </View>
      </View>

      <View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]}>
        <InfoRow label="Reason" value={data.reason.name} />
        <InfoRow label="Submitted" value={formatDate(createdAt)} />
        {data.details ? (
          <View style={s.detailsSection}>
            <Text style={s.infoLabel} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              Details
            </Text>
            <Text style={s.detailsValue}>{data.details}</Text>
          </View>
        ) : null}
      </View>

      {data.resolution_note ? (
        <View style={[s.card, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]}>
          <Text style={s.sectionTitle}>Resolution Note</Text>
          <Text style={s.resolutionNote} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]}>
            {data.resolution_note}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default PostReportDetailsScreen;

const s = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 62,
  },
  scrollView: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    flexShrink: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
  },
  detailsSection: {
    paddingTop: 12,
  },
  detailsValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  resolutionNote: {
    fontSize: 16,
    lineHeight: 22,
  },
});
