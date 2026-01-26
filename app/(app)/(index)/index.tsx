import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { RefreshControl, Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getFeedForQuery } from "@/api/post";
import AnnouncementsHeader from "@/components/AnnouncementsHeader/AnnouncementsHeader";
import LoadingRetryFooterWithEnd from "@/components/Footer/LoadingRetryFooterWithEnd/LoadingRetryFooterWithEnd";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import PostSkeleton from "@/components/LoadingSkeletons/PostSkeleton";
import Post from "@/components/Post/Post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";
import { getNextPageParam } from "@/utils/utils";

const HEADER_HEIGHT = 90;

const FeedScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { isDarkMode } = useColorMode();
  const insets = useSafeAreaInsets();
  const { selectedProfileId } = useAuthUserContext();
  const { authProfile } = useAuthProfileContext();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFeedForQuery(pageParam);
    return res.data;
  };

  const feedPosts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "feed"],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId && !!authProfile.id,
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  // interpolated value for sliding the header up when scrolling down
  const headerTranslateY = scrollY.interpolate({
    inputRange: [-insets.top + -HEADER_HEIGHT, insets.top + HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  // interpolated value for fading out the header logo
  const headerLogoOpacity = scrollY.interpolate({
    inputRange: [0, insets.top + HEADER_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // interpolated value for scaling the header logo
  const headerLogoScale = scrollY.interpolate({
    inputRange: [-(insets.top + HEADER_HEIGHT + 100), insets.top + HEADER_HEIGHT],
    outputRange: [2, 0.7],
    extrapolate: "clamp",
  });

  // interpolated value for the header border bottom color
  const borderColor = scrollY.interpolate({
    inputRange: [0, insets.top + HEADER_HEIGHT],
    outputRange: isDarkMode ? [COLORS.zinc[950], COLORS.zinc[900]] : [COLORS.zinc[200], COLORS.zinc[300]],
    extrapolate: "clamp",
  });

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Animated.View
          style={[
            s.header,
            {
              height: insets.top + HEADER_HEIGHT,
              transform: [{ translateY: headerTranslateY }],
              backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[200],
              borderBottomColor: borderColor,
            },
          ]}
        >
          <Animated.View
            style={{ paddingBottom: 8, opacity: headerLogoOpacity, transform: [{ scale: headerLogoScale }] }}
          >
            <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} height={20} width={130} />
          </Animated.View>
        </Animated.View>
      ),
    });
  }, [navigation, isDarkMode, headerTranslateY, headerLogoOpacity, insets.top, borderColor, headerLogoScale]);

  const handleProfilePress = (profileId: number | string, username?: string) => {
    router.push({ pathname: "/(app)/(index)/profileDetails", params: { profileId, username: username } });
  };

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return feedPosts.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [feedPosts.data]);

  const handleEndReached = () => {
    const hasErrors = feedPosts.isError || feedPosts.isFetchNextPageError;
    const isLoading = feedPosts.isLoading || feedPosts.isFetchingNextPage;

    if (feedPosts.hasNextPage && !hasErrors && !isLoading) {
      feedPosts.fetchNextPage();
    }
  };

  return (
    <FlashList
      data={dataToRender}
      ListHeaderComponent={<AnnouncementsHeader />}
      showsVerticalScrollIndicator={false}
      refreshing={feedPosts.isRefetching}
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: tabBarHeight,
        paddingTop: HEADER_HEIGHT + 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={feedPosts.isRefetching}
          onRefresh={feedPosts.refetch}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
          progressViewOffset={insets.top + HEADER_HEIGHT + 10}
        />
      }
      renderItem={({ item }) => <Post post={item} onProfilePress={handleProfilePress} />}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
      onEndReached={handleEndReached}
      ListFooterComponent={
        <LoadingRetryFooterWithEnd
          showEndMessage={
            !feedPosts.hasNextPage &&
            !feedPosts.isFetchingNextPage &&
            !feedPosts.isLoading &&
            feedPosts.data &&
            !feedPosts.isError
              ? true
              : false
          }
          isLoading={feedPosts.isFetchingNextPage}
          isError={feedPosts.isFetchNextPageError}
          fetchNextPage={feedPosts.fetchNextPage}
        />
      }
      ListEmptyComponent={
        <ListEmptyComponent
          isLoading={!feedPosts.data || feedPosts.isLoading || feedPosts.isFetching}
          isError={feedPosts.isError}
          isRefetching={feedPosts.isRefetching}
          loadingComponent={
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          }
          emptyMessage="Oh no! Your feed is empty. Follow some users to see their posts here!"
          containerStyle={s.emptyComponentContainer}
          errorMessage="There was an error fetching your feed."
          errorSubMessage="Swipe down to try again."
        />
      }
      onScroll={(event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollY.setValue(offsetY);
      }}
      scrollEventThrottle={16}
    />
  );
};

export default FeedScreen;

const s = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  emptyComponentContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: -100,
  },
});
