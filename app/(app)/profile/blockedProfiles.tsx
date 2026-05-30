import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";

import { getBlockedProfiles, type BlockedProfile } from "@/api/block";
import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ProfileImage from "@/components/ProfileImage/ProfileImage";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import Button from "@/shared/ui/Button/Button";
import Text from "@/shared/ui/Text/Text";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const BlockedProfileItem = ({
  item,
  onUnblock,
  isUnblocking,
}: {
  item: BlockedProfile;
  onUnblock: (publicId: string) => void;
  isUnblocking: boolean;
}) => {
  const { setLightOrDark } = useColorMode();
  const profile = item.blocked_profile;
  const blockedAt = new Date(item.created_at);

  return (
    <View style={[s.itemCard, { backgroundColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]) }]}>
      <View style={s.itemContent}>
        <ProfileImage image={profile.image} size={48} />
        <View style={s.textContainer}>
          <Text style={s.username} numberOfLines={1}>
            {profile.username}
          </Text>
          {profile.name ? (
            <Text style={s.name} numberOfLines={1} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              {profile.name}
            </Text>
          ) : null}
          <Text style={s.dateText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
            Blocked {blockedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </Text>
        </View>
      </View>
      <Button
        text="Unblock"
        onPress={() => onUnblock(profile.public_id)}
        loading={isUnblocking}
        variant="secondary"
        buttonStyle={[s.unblockButton, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]) }]}
        textStyle={{ ...s.unblockText, color: setLightOrDark(COLORS.zinc[700], COLORS.zinc[300]) }}
      />
    </View>
  );
};

const BlockedProfilesScreen = () => {
  const queryClient = useQueryClient();
  const { selectedProfileId } = useAuthProfileContext();
  const { unblockProfile } = useProfileDetailsManagerContext();
  const tabBarHeight = useBottomTabBarHeight();

  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchBlockedProfiles = async ({ pageParam }: { pageParam: string }) => {
    const res = await getBlockedProfiles(pageParam);
    return res.data;
  };

  const blockedProfiles = useInfiniteQuery({
    queryKey: queryKeys.blockedProfiles.root(selectedProfileId),
    queryFn: fetchBlockedProfiles,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
  });

  const dataToRender = useMemo(() => {
    return blockedProfiles.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [blockedProfiles.data]);

  const handleUnblock = async (publicId: string) => {
    setUnblockingId(publicId);
    await unblockProfile(publicId);
    queryClient.invalidateQueries({ queryKey: queryKeys.blockedProfiles.root(selectedProfileId) });
    setUnblockingId(null);
  };

  const handleEndReached = () => {
    const hasErrors = blockedProfiles.isError || blockedProfiles.isFetchNextPageError;
    const isLoading = blockedProfiles.isLoading || blockedProfiles.isFetchingNextPage;

    if (blockedProfiles.hasNextPage && !hasErrors && !isLoading) {
      blockedProfiles.fetchNextPage();
    }
  };

  if (blockedProfiles.isLoading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  }

  if (!blockedProfiles.isLoading && blockedProfiles.isError) {
    return (
      <ErrorMessageWithRefresh
        refresh={blockedProfiles.refetch}
        errorText="There was an error fetching blocked profiles"
      />
    );
  }

  return (
    <FlashList
      data={dataToRender}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 16, paddingTop: 16, paddingHorizontal: 16, flexGrow: 1 }}
      refreshing={blockedProfiles.isRefetching}
      refreshControl={
        <RefreshControl
          refreshing={blockedProfiles.isRefetching}
          onRefresh={blockedProfiles.refetch}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
        />
      }
      renderItem={({ item }) => (
        <BlockedProfileItem
          item={item}
          onUnblock={handleUnblock}
          isUnblocking={unblockingId === item.blocked_profile.public_id}
        />
      )}
      ListEmptyComponent={
        <View style={s.emptyContainer}>
          <Text style={s.emptyTitle}>No blocked profiles</Text>
          <Text style={s.emptyDescription} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            Profiles you block will appear here.
          </Text>
        </View>
      }
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={blockedProfiles.isFetchingNextPage}
          isError={blockedProfiles.isFetchNextPageError}
          fetchNextPage={blockedProfiles.fetchNextPage}
          message="There was an error fetching more blocked profiles."
        />
      }
    />
  );
};

export default BlockedProfilesScreen;

const s = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 62,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: "600",
  },
  name: {
    fontSize: 14,
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    marginTop: 4,
  },
  unblockButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 34,
    width: 100,
  },
  unblockText: {
    fontSize: 15,
    fontWeight: "500",
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
