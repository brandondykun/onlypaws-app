import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useRef } from "react";
import { View, RefreshControl, Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import PostSkeleton from "@/components/LoadingSkeletons/PostSkeleton";
import Post from "@/components/Post/Post";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useFeedPostsContext } from "@/context/FeedPostsContext";
import { useFeedProfileDetailsContext } from "@/context/FeedProfileDetailsContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";

const HEADER_HEIGHT = 90;

const FeedScreen = () => {
  const feed = useFeedPostsContext();
  const profile = useFeedProfileDetailsContext(); // selected profile in this stack
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { isDarkMode } = useColorMode();
  const insets = useSafeAreaInsets();

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
    inputRange: [0, insets.top + HEADER_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  // interpolated value for the header border bottom color
  const borderColor = scrollY.interpolate({
    inputRange: [0, insets.top + HEADER_HEIGHT],
    outputRange: isDarkMode ? [COLORS.zinc[950], COLORS.zinc[900]] : [COLORS.zinc[50], COLORS.zinc[100]],
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
              backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
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

  const handleProfilePress = (profileId: number | string) => {
    profile.setProfileId(Number(profileId));
    router.push({ pathname: "/(app)/(index)/profileDetails", params: { profileId } });
  };

  const emptyComponent = !feed.initialFetchComplete ? (
    <>
      <PostSkeleton />
      <PostSkeleton />
    </>
  ) : (
    <View style={s.emptyComponentContainer}>
      <Text style={s.emptyComponentText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        Oh no! Your feed is empty. Follow some users to see their posts here!
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={feed.data}
        showsVerticalScrollIndicator={false}
        refreshing={feed.refreshing}
        contentContainerStyle={{ paddingBottom: tabBarHeight, paddingTop: insets.top + HEADER_HEIGHT - 20 }}
        refreshControl={
          <RefreshControl
            refreshing={feed.refreshing}
            onRefresh={feed.refresh}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
            progressViewOffset={insets.top + HEADER_HEIGHT}
          />
        }
        renderItem={({ item }) => <Post post={item} onProfilePress={handleProfilePress} />}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.2} // Trigger when 20% from the bottom
        onEndReached={
          !feed.fetchNextLoading && !feed.hasFetchNextError && !feed.hasInitialFetchError
            ? () => feed.fetchNext()
            : null
        }
        ListFooterComponent={
          feed.data.length > 0 ? (
            <FlatListLoadingFooter nextUrl={feed.fetchNextUrl} fetchNextLoading={feed.fetchNextLoading} />
          ) : null
        }
        ListEmptyComponent={emptyComponent}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          scrollY.setValue(offsetY);
        }}
        scrollEventThrottle={16}
      />
    </View>
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
    paddingTop: "50%",
  },
  emptyComponentText: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 36,
    fontWeight: "300",
  },
});
