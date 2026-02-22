import Entypo from "@expo/vector-icons/Entypo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { RefreshControl, View, StyleSheet } from "react-native";

import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import NotificationListItem from "@/components/NotificationListItem/NotificationListItem";
import NotificationsScreenHeader from "@/components/NotificationsScreenHeader/NotificationsScreenHeader";
import Pressable from "@/components/Pressable/Pressable";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { useNotificationsContext } from "@/context/NotificationsContext";
import toast from "@/utils/toast";

const NotificationsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const router = useRouter();
  const { setLightOrDark } = useColorMode();
  const { hasReceivedRequests, hasSentRequests } = useFollowRequestsContext();

  // Get all notification data and controls from the centralized context
  const {
    allNotifications,
    unreadCount,
    refresh,
    isRefetching,
    isPending,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isFetchNextPageError,
    markAllAsRead,
    markAllAsReadLoading,
    isLoading,
  } = useNotificationsContext();

  // Custom refresh function that triggers haptic feedback
  const handleRefresh = async () => {
    Haptics.impactAsync();
    await refresh();
  };

  // Mark all notifications as read with error handling
  const setAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Success - no need to do anything as context handles state updates
    } catch {
      toast.error("Failed to update notifications. Please try again.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Posts",
    });
  }, [navigation]);

  const handleEndReached = () => {
    const hasErrors = isError || isFetchNextPageError;
    const loading = isLoading || isFetchingNextPage;

    if (hasNextPage && !hasErrors && !loading) {
      fetchNextPage();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <NotificationsScreenHeader
        onMarkAllAsReadPress={setAllAsRead}
        unreadCount={unreadCount}
        markAllAsReadLoading={markAllAsReadLoading}
      />
      {hasReceivedRequests || hasSentRequests ? (
        <Pressable
          onPress={() => router.push("/posts/followRequests")}
          style={{
            ...s.followRequestsButton,
            borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[900]),
            backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[925]),
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "400" }} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[800]}>
            View Follow Requests
          </Text>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            {hasReceivedRequests ? (
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 25,
                  backgroundColor: setLightOrDark(COLORS.lime[500], COLORS.red[500]),
                }}
              />
            ) : null}
            <Entypo name="chevron-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
          </View>
        </Pressable>
      ) : null}
      <FlashList
        showsVerticalScrollIndicator={false}
        data={allNotifications}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: tabBarHeight, paddingHorizontal: 16, flexGrow: 1 }}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        onEndReached={handleEndReached}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[900]) }} />
        )}
        refreshing={isRefetching}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        ListEmptyComponent={
          <ListEmptyComponent
            isLoading={isPending}
            isError={isError}
            isRefetching={isRefetching}
            errorMessage="There was an error fetching your notifications."
            errorSubMessage="Swipe down to try again."
            emptyMessage="No notifications"
          />
        }
        renderItem={({ item, index }) => <NotificationListItem item={item} index={index} />}
        ListFooterComponent={
          <LoadingRetryFooter
            isLoading={isFetchingNextPage}
            isError={isFetchNextPageError}
            fetchNextPage={fetchNextPage}
            message="Oh no! There was an error fetching more notifications!"
          />
        }
      />
    </View>
  );
};

export default NotificationsScreen;

const s = StyleSheet.create({
  followRequestsButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginHorizontal: -16,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
