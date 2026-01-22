import Entypo from "@expo/vector-icons/Entypo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { ActivityIndicator, RefreshControl, View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import NotificationListItem from "@/components/NotificationListItem/NotificationListItem";
import NotificationsScreenHeader from "@/components/NotificationsScreenHeader/NotificationsScreenHeader";
import Pressable from "@/components/Pressable/Pressable";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { useNotificationsContext } from "@/context/NotificationsContext";

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
    refreshing,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
    markAllAsRead,
    markAllAsReadLoading,
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
      Toast.show({ type: "error", text1: "error", text2: "Failed to update notifications. Please try again." });
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Posts",
    });
  }, [navigation]);

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <LoadingFooter />
  ) : hasFetchNextError ? (
    <RetryFetchFooter
      fetchFn={fetchNext}
      message="Oh no! There was an error fetching notifications!"
      buttonText="Retry"
    />
  ) : null;

  const emptyComponent =
    !initialFetchComplete || (hasInitialFetchError && refreshing) ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLORS.zinc[500]} />
      </View>
    ) : hasInitialFetchError ? (
      <View style={{ paddingTop: 96, paddingHorizontal: 24 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error fetching your notifications. Swipe down to try again.
        </Text>
      </View>
    ) : !refreshing ? (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            paddingHorizontal: 36,
            fontWeight: "300",
            paddingTop: 96,
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          No Notifications
        </Text>
      </View>
    ) : null;

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
            {hasReceivedRequests || hasSentRequests ? (
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
        contentContainerStyle={{ paddingBottom: tabBarHeight, paddingHorizontal: 16 }}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.5} // Trigger when 50% from the bottom
        onEndReached={!fetchNextLoading && !hasFetchNextError && !hasInitialFetchError ? fetchNext : null}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[900]) }} />
        )}
        refreshing={refreshing}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        ListEmptyComponent={emptyComponent}
        renderItem={({ item, index }) => <NotificationListItem item={item} index={index} />}
        ListFooterComponent={footerComponent}
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
