import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import Toast from "react-native-toast-message";

import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import NotificationListItem from "@/components/NotificationListItem/NotificationListItem";
import NotificationsScreenHeader from "@/components/NotificationsScreenHeader/NotificationsScreenHeader";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useNotificationsContext } from "@/context/NotificationsContext";

const NotificationsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { setLightOrDark } = useColorMode();

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
