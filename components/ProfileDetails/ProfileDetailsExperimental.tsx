// This is a WIP experimental component for the profile details screen.
// It is not used in the app yet.
// Ideally it will show the details header and have tabs below that show the posts and tagged posts.

// import { SimpleLineIcons } from "@expo/vector-icons";
// import Entypo from "@expo/vector-icons/Entypo";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
// import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
// import { FlashList } from "@shopify/flash-list";
// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
// import { useNavigation, useRouter } from "expo-router";
// import { useLayoutEffect, useMemo, useRef, useState, useCallback, memo } from "react";
// import React from "react";
// import { View, RefreshControl, Pressable, StyleSheet, Dimensions } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedScrollHandler,
//   useAnimatedStyle,
//   interpolate,
//   Extrapolation,
//   runOnJS,
// } from "react-native-reanimated";
// import { TabView } from "react-native-tab-view";
// import Toast from "react-native-toast-message";

// import { unfollowProfile, followProfile } from "@/api/interactions";
// import { getTaggedPostsForQuery } from "@/api/post";
// import { getProfileDetailsForQuery, getProfilePostsForQuery } from "@/api/profile";
// import Text from "@/components/Text/Text";
// import { COLORS } from "@/constants/Colors";
// import { useAuthProfileContext } from "@/context/AuthProfileContext";
// import { useAuthUserContext } from "@/context/AuthUserContext";
// import { useColorMode } from "@/context/ColorModeContext";
// import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
// import { ProfileDetails as ProfileDetailsType } from "@/types";
// import { getNextPageParam, minutesToMilliseconds } from "@/utils/utils";

// import BottomSheetModal from "../BottomSheet/BottomSheet";
// import LoadingFooter from "../LoadingFooter/LoadingFooter";
// import PostTileSkeleton from "../LoadingSkeletons/PostTileSkeleton";
// import PostTile from "../PostTile/PostTile";
// import ProfileDetailsHeader from "../ProfileDetailsHeader/ProfileDetailsHeader";
// import RetryFetchFooter from "../RetryFetchFooter/RetryFetchFooter";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// type Props = {
//   profileId: number | string;
//   onPostPreviewPress: (index: number) => void;
// };

// // Memoized item separator
// const ItemSeparator = memo(() => <View style={{ height: 1 }} />);
// ItemSeparator.displayName = "ItemSeparator";

// // Animated FlashList for scroll handling
// const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

// const ProfileDetails = ({ profileId, onPostPreviewPress }: Props) => {
//   const navigation = useNavigation();
//   const router = useRouter();
//   const tabBarHeight = useBottomTabBarHeight();
//   const optionsModalRef = useRef<RNBottomSheetModal>(null);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const postsListRef = useRef<any>(null);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const taggedListRef = useRef<any>(null);

//   const { isDarkMode } = useColorMode();
//   const { authProfile } = useAuthProfileContext();
//   const { selectedProfileId } = useAuthUserContext();
//   const profileDetailsManager = useProfileDetailsManagerContext();

//   const [followLoading, setFollowLoading] = useState(false);
//   const [tabIndex, setTabIndex] = useState(0);
//   const [routes] = useState([
//     { key: "posts", title: "Posts" },
//     { key: "tagged", title: "Tagged" },
//   ]);
//   const [headerHeight, setHeaderHeight] = useState(0);

//   // Scroll position tracking for syncing between tabs
//   const postsScrollY = useRef(0);
//   const taggedScrollY = useRef(0);
//   const currentScrollY = useSharedValue(0);
//   const activeTabRef = useRef(0);

//   // Memoize fetch functions
//   const fetchProfile = useCallback(async (id: number | string) => {
//     const res = await getProfileDetailsForQuery(id);
//     return res.data;
//   }, []);

//   const fetchPosts = useCallback(
//     async ({ pageParam }: { pageParam: string }) => {
//       const res = await getProfilePostsForQuery(profileId, pageParam);
//       return res.data;
//     },
//     [profileId],
//   );

//   const fetchTaggedPosts = useCallback(
//     async ({ pageParam }: { pageParam: string }) => {
//       const res = await getTaggedPostsForQuery(profileId, pageParam);
//       return res.data;
//     },
//     [profileId],
//   );

//   // Memoize query keys
//   const profileQueryKey = useMemo(
//     () => [selectedProfileId, "profile", profileId.toString()],
//     [selectedProfileId, profileId],
//   );

//   const postsQueryKey = useMemo(
//     () =>
//       profileId === authProfile.id
//         ? [selectedProfileId, "posts", "authProfile"]
//         : [selectedProfileId, "posts", "profile", profileId.toString()],
//     [profileId, authProfile.id, selectedProfileId],
//   );

//   const taggedQueryKey = useMemo(
//     () =>
//       profileId === authProfile.id
//         ? [selectedProfileId, "tagged", profileId.toString()]
//         : [selectedProfileId, "tagged", "profile", profileId.toString()],
//     [profileId, authProfile.id, selectedProfileId],
//   );

//   const staleTime = useMemo(
//     () => (profileId === authProfile.id ? 0 : minutesToMilliseconds(5)),
//     [profileId, authProfile.id],
//   );

//   const profile = useQuery({
//     queryKey: profileQueryKey,
//     queryFn: () => fetchProfile(profileId),
//     staleTime,
//     enabled: !!selectedProfileId,
//   });

//   const posts = useInfiniteQuery({
//     queryKey: postsQueryKey,
//     queryFn: fetchPosts,
//     initialPageParam: "1",
//     getNextPageParam: (lastPage) => getNextPageParam(lastPage),
//     staleTime,
//     enabled: !!selectedProfileId,
//   });

//   const tagged = useInfiniteQuery({
//     queryKey: taggedQueryKey,
//     queryFn: fetchTaggedPosts,
//     initialPageParam: "1",
//     getNextPageParam: (lastPage) => getNextPageParam(lastPage),
//     staleTime,
//     enabled: !!selectedProfileId,
//   });

//   // Memoize the flattened data
//   const postsData = useMemo(() => posts.data?.pages.flatMap((page) => page.results) ?? [], [posts.data]);
//   const taggedData = useMemo(() => tagged.data?.pages.flatMap((page) => page.results) ?? [], [tagged.data]);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       title: profile.data ? `@${profile.data.username}` : "",
//       headerRight: () => {
//         if (profile.data?.id === authProfile.id) {
//           return (
//             <Pressable
//               onPressOut={() => optionsModalRef.current?.present()}
//               style={({ pressed }) => [pressed && { opacity: 0.7 }, { paddingLeft: 24, paddingVertical: 8 }]}
//               hitSlop={20}
//               testID="profile-details-menu-button"
//             >
//               <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
//             </Pressable>
//           );
//         }
//         return null;
//       },
//     });
//   }, [profile.data, navigation, isDarkMode, authProfile.id]);

//   // Use ref to store onPostPreviewPress to avoid stale closure
//   const onPostPreviewPressRef = useRef(onPostPreviewPress);
//   onPostPreviewPressRef.current = onPostPreviewPress;

//   const handleUnfollowPress = useCallback(
//     async (profileIdToUnfollow: number) => {
//       setFollowLoading(true);
//       const { error } = await unfollowProfile(profileIdToUnfollow);
//       if (!error) {
//         profileDetailsManager.onUnfollow(profileIdToUnfollow);
//       } else {
//         Toast.show({ type: "error", text1: "Error", text2: "There was an error unfollowing that account." });
//       }
//       setTimeout(() => setFollowLoading(false), 100);
//     },
//     [profileDetailsManager],
//   );

//   const handleFollowPress = useCallback(
//     async (profileToFollow: ProfileDetailsType) => {
//       setFollowLoading(true);
//       const { error, data } = await followProfile(profileToFollow.id);
//       if (!error && data) {
//         profileDetailsManager.onFollow(profileToFollow.id);
//       } else {
//         Toast.show({ type: "error", text1: "Error", text2: "There was an error following that account." });
//       }
//       setTimeout(() => setFollowLoading(false), 100);
//     },
//     [profileDetailsManager],
//   );

//   const handleFollowersPress = useCallback(() => {
//     if (profileId === authProfile.id) {
//       router.push("/(app)/posts/followers");
//     }
//   }, [profileId, authProfile.id, router]);

//   const handleFollowingPress = useCallback(() => {
//     if (profileId === authProfile.id) {
//       router.push("/(app)/posts/following");
//     }
//   }, [profileId, authProfile.id, router]);

//   const handlePostsRefresh = useCallback(() => {
//     profile.refetch();
//     posts.refetch();
//   }, [profile, posts]);

//   const handleTaggedRefresh = useCallback(() => {
//     profile.refetch();
//     tagged.refetch();
//   }, [profile, tagged]);

//   const postsKeyExtractor = useCallback((item: any) => `posts-${item.id}`, []);
//   const taggedKeyExtractor = useCallback((item: any) => `tagged-${item.id}`, []);

//   const renderPostItem = useCallback(({ item, index }: { item: any; index: number }) => {
//     return <PostTile post={item} index={index} onPress={() => onPostPreviewPressRef.current(index)} />;
//   }, []);

//   const handlePostsEndReached = useCallback(() => {
//     if (!posts.isFetchingNextPage && !posts.isLoading && !posts.isError && !posts.isFetchNextPageError) {
//       posts.fetchNextPage();
//     }
//   }, [posts]);

//   const handleTaggedEndReached = useCallback(() => {
//     if (!tagged.isFetchingNextPage && !tagged.isLoading && !tagged.isError && !tagged.isFetchNextPageError) {
//       tagged.fetchNextPage();
//     }
//   }, [tagged]);

//   // Sync scroll position when switching tabs
//   const syncScrollPosition = useCallback(
//     (newIndex: number) => {
//       const targetScrollY = Math.min(currentScrollY.value, headerHeight);

//       if (newIndex === 0) {
//         // Switching to posts
//         if (postsScrollY.current < targetScrollY && postsListRef.current) {
//           postsListRef.current.scrollToOffset({ offset: targetScrollY, animated: false });
//         }
//       } else {
//         // Switching to tagged
//         if (taggedScrollY.current < targetScrollY && taggedListRef.current) {
//           taggedListRef.current.scrollToOffset({ offset: targetScrollY, animated: false });
//         }
//       }
//     },
//     [currentScrollY, headerHeight],
//   );

//   // Handle tab index change
//   const handleIndexChange = useCallback(
//     (index: number) => {
//       activeTabRef.current = index;
//       syncScrollPosition(index);
//       setTabIndex(index);
//     },
//     [syncScrollPosition],
//   );

//   // Update scroll position ref on scroll
//   const updatePostsScroll = useCallback((y: number) => {
//     postsScrollY.current = y;
//   }, []);

//   const updateTaggedScroll = useCallback((y: number) => {
//     taggedScrollY.current = y;
//   }, []);

//   // Animated scroll handlers - only update currentScrollY when scrolling the active tab
//   const postsScrollHandler = useAnimatedScrollHandler({
//     onScroll: (event) => {
//       if (activeTabRef.current === 0) {
//         currentScrollY.value = event.contentOffset.y;
//       }
//       runOnJS(updatePostsScroll)(event.contentOffset.y);
//     },
//   });

//   const taggedScrollHandler = useAnimatedScrollHandler({
//     onScroll: (event) => {
//       if (activeTabRef.current === 1) {
//         currentScrollY.value = event.contentOffset.y;
//       }
//       runOnJS(updateTaggedScroll)(event.contentOffset.y);
//     },
//   });

//   // Animated header style - translates up as you scroll, clamped to headerHeight
//   const animatedHeaderStyle = useAnimatedStyle(() => {
//     const translateY = interpolate(currentScrollY.value, [0, headerHeight], [0, -headerHeight], Extrapolation.CLAMP);
//     return {
//       transform: [{ translateY }],
//     };
//   });

//   // Measure header height
//   const handleHeaderLayout = useCallback(
//     (event: { nativeEvent: { layout: { height: number } } }) => {
//       const height = event.nativeEvent.layout.height;
//       if (height > 0 && height !== headerHeight) {
//         setHeaderHeight(height);
//       }
//     },
//     [headerHeight],
//   );

//   // Empty components
//   const postsEmptyComponent = useMemo(() => {
//     if (posts.isLoading || posts.isRefetching) {
//       return <PostTileSkeleton />;
//     }
//     if (!posts.isError) {
//       return (
//         <View style={s.emptyContainer}>
//           <Text style={s.emptyText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
//             {authProfile.id === profileId
//               ? "You don't have any posts yet! Add a post to see it here."
//               : "No posts to see yet."}
//           </Text>
//         </View>
//       );
//     }
//     return (
//       <View style={[s.errorContainer, { backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50] }]}>
//         <Ionicons name="alert-circle-outline" size={36} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
//         <Text style={s.errorTitle}>Error loading posts</Text>
//         <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={s.errorSubtitle}>
//           Swipe down to refresh
//         </Text>
//         <Entypo name="chevron-thin-down" size={20} color={COLORS.zinc[500]} />
//       </View>
//     );
//   }, [posts.isLoading, posts.isRefetching, posts.isError, authProfile.id, profileId, isDarkMode]);

//   const taggedEmptyComponent = useMemo(() => {
//     if (tagged.isLoading || tagged.isRefetching) {
//       return <PostTileSkeleton />;
//     }
//     if (!tagged.isError) {
//       return (
//         <View style={s.emptyContainer}>
//           <Text style={s.emptyText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
//             No tagged posts yet.
//           </Text>
//         </View>
//       );
//     }
//     return (
//       <View style={[s.errorContainer, { backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50] }]}>
//         <Ionicons name="alert-circle-outline" size={36} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
//         <Text style={s.errorTitle}>Error loading tagged posts</Text>
//         <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={s.errorSubtitle}>
//           Swipe down to refresh
//         </Text>
//         <Entypo name="chevron-thin-down" size={20} color={COLORS.zinc[500]} />
//       </View>
//     );
//   }, [tagged.isLoading, tagged.isRefetching, tagged.isError, isDarkMode]);

//   // Footer components
//   const postsFooterComponent = useMemo(() => {
//     if (posts.isFetchingNextPage) return <LoadingFooter />;
//     if (posts.isFetchNextPageError) {
//       return (
//         <RetryFetchFooter
//           fetchFn={posts.fetchNextPage}
//           message="Oh no! There was an error fetching more posts!"
//           buttonText="Retry"
//         />
//       );
//     }
//     return null;
//   }, [posts.isFetchingNextPage, posts.isFetchNextPageError, posts.fetchNextPage]);

//   const taggedFooterComponent = useMemo(() => {
//     if (tagged.isFetchingNextPage) return <LoadingFooter />;
//     if (tagged.isFetchNextPageError) {
//       return (
//         <RetryFetchFooter
//           fetchFn={tagged.fetchNextPage}
//           message="Oh no! There was an error fetching more posts!"
//           buttonText="Retry"
//         />
//       );
//     }
//     return null;
//   }, [tagged.isFetchingNextPage, tagged.isFetchNextPageError, tagged.fetchNextPage]);

//   const handleSavedPostsPress = useCallback(() => {
//     router.push("/posts/savedPosts");
//     optionsModalRef.current?.dismiss();
//   }, [router]);

//   // Header spacer to push content below the floating header
//   const HeaderSpacer = useMemo(() => <View style={{ height: headerHeight }} />, [headerHeight]);

//   // Render scene for TabView
//   const renderScene = useCallback(
//     ({ route }: { route: { key: string } }) => {
//       const isPostsTab = route.key === "posts";
//       const data = isPostsTab ? postsData : taggedData;
//       const query = isPostsTab ? posts : tagged;
//       const emptyComponent = isPostsTab ? postsEmptyComponent : taggedEmptyComponent;
//       const footerComponent = isPostsTab ? postsFooterComponent : taggedFooterComponent;
//       const keyExtractor = isPostsTab ? postsKeyExtractor : taggedKeyExtractor;
//       const handleEndReached = isPostsTab ? handlePostsEndReached : handleTaggedEndReached;
//       const handleRefresh = isPostsTab ? handlePostsRefresh : handleTaggedRefresh;
//       const scrollHandler = isPostsTab ? postsScrollHandler : taggedScrollHandler;
//       const listRef = isPostsTab ? postsListRef : taggedListRef;

//       return (
//         <AnimatedFlashList
//           ref={listRef}
//           showsVerticalScrollIndicator={false}
//           data={query.isLoading || query.isRefetching ? [] : data}
//           numColumns={3}
//           ItemSeparatorComponent={ItemSeparator}
//           keyExtractor={keyExtractor}
//           {...{ estimatedItemSize: 130 }}
//           contentContainerStyle={{ paddingBottom: tabBarHeight }}
//           onEndReachedThreshold={0.3}
//           onEndReached={handleEndReached}
//           ListEmptyComponent={emptyComponent}
//           ListFooterComponent={footerComponent}
//           ListHeaderComponent={HeaderSpacer}
//           renderItem={renderPostItem}
//           onScroll={scrollHandler}
//           scrollEventThrottle={16}
//           refreshControl={
//             <RefreshControl
//               refreshing={profile.isRefetching || query.isRefetching}
//               onRefresh={handleRefresh}
//               tintColor={COLORS.zinc[400]}
//               colors={[COLORS.zinc[400]]}
//             />
//           }
//         />
//       );
//     },
//     [
//       postsData,
//       taggedData,
//       posts,
//       tagged,
//       postsEmptyComponent,
//       taggedEmptyComponent,
//       postsFooterComponent,
//       taggedFooterComponent,
//       postsKeyExtractor,
//       taggedKeyExtractor,
//       handlePostsEndReached,
//       handleTaggedEndReached,
//       handlePostsRefresh,
//       handleTaggedRefresh,
//       postsScrollHandler,
//       taggedScrollHandler,
//       tabBarHeight,
//       HeaderSpacer,
//       renderPostItem,
//       profile.isRefetching,
//     ],
//   );

//   return (
//     <>
//       <View style={s.container}>
//         {/* Floating Header - animates up/down based on scroll */}
//         <Animated.View
//           style={[
//             s.floatingHeader,
//             { backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50] },
//             animatedHeaderStyle,
//           ]}
//           onLayout={handleHeaderLayout}
//         >
//           <ProfileDetailsHeader
//             profileData={profile.data!}
//             postsCount={profile.data?.posts_count!}
//             handleFollowersPress={handleFollowersPress}
//             handleFollowingPress={handleFollowingPress}
//             handleUnfollowPress={handleUnfollowPress}
//             handleFollowPress={handleFollowPress}
//             profileLoading={profile.isLoading}
//             followLoading={followLoading}
//             profileError={profile.isLoadingError}
//           />
//           {/* Tab Bar - inside floating header so it scrolls with it */}
//           <View style={[s.tabBar, { backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50] }]}>
//             <Pressable style={s.tabButton} onPress={() => handleIndexChange(0)}>
//               <MaterialCommunityIcons
//                 name="grid"
//                 size={24}
//                 color={
//                   tabIndex === 0
//                     ? isDarkMode
//                       ? COLORS.zinc[100]
//                       : COLORS.zinc[900]
//                     : isDarkMode
//                       ? COLORS.zinc[500]
//                       : COLORS.zinc[400]
//                 }
//               />
//             </Pressable>
//             <Pressable style={s.tabButton} onPress={() => handleIndexChange(1)}>
//               <MaterialCommunityIcons
//                 name="account-box-outline"
//                 size={26}
//                 color={
//                   tabIndex === 1
//                     ? isDarkMode
//                       ? COLORS.zinc[100]
//                       : COLORS.zinc[900]
//                     : isDarkMode
//                       ? COLORS.zinc[500]
//                       : COLORS.zinc[400]
//                 }
//               />
//             </Pressable>
//           </View>
//           {/* Tab Indicator */}
//           <View style={s.tabIndicatorContainer}>
//             <View
//               style={[
//                 s.tabIndicator,
//                 {
//                   backgroundColor: isDarkMode ? COLORS.zinc[100] : COLORS.zinc[900],
//                   left: tabIndex === 0 ? "0%" : "50%",
//                 },
//               ]}
//             />
//           </View>
//         </Animated.View>

//         {/* TabView with horizontal swipe between Posts and Tagged - TabBar hidden */}
//         <TabView
//           navigationState={{ index: tabIndex, routes }}
//           renderScene={renderScene}
//           renderTabBar={() => null}
//           onIndexChange={handleIndexChange}
//           initialLayout={{ width: SCREEN_WIDTH }}
//           lazy
//           lazyPreloadDistance={0}
//         />
//       </View>

//       <BottomSheetModal handleTitle="Options" ref={optionsModalRef} enableDynamicSizing={true} snapPoints={[]}>
//         <BottomSheetView style={s.bottomSheetView}>
//           <View
//             style={{
//               borderRadius: 8,
//               overflow: "hidden",
//               backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
//             }}
//           >
//             <Pressable style={({ pressed }) => [pressed && { opacity: 0.5 }]} onPress={handleSavedPostsPress}>
//               <View style={s.optionButton}>
//                 <FontAwesome name="bookmark" size={18} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[800]} />
//                 <Text style={{ fontSize: 18 }}>View Saved Posts</Text>
//               </View>
//             </Pressable>
//           </View>
//         </BottomSheetView>
//       </BottomSheetModal>
//     </>
//   );
// };

// export default ProfileDetails;

// const s = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   floatingHeader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//   },
//   tabBar: {
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: COLORS.zinc[800],
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//   },
//   tabIndicatorContainer: {
//     height: 1,
//     position: "relative",
//   },
//   tabIndicator: {
//     position: "absolute",
//     width: "50%",
//     height: 1,
//   },
//   emptyContainer: {
//     flex: 1,
//     padding: 16,
//     justifyContent: "center",
//   },
//   emptyText: {
//     fontSize: 18,
//     textAlign: "center",
//     paddingHorizontal: 36,
//     fontWeight: "300",
//     paddingTop: 96,
//   },
//   errorContainer: {
//     height: 280,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 12,
//   },
//   errorTitle: {
//     fontSize: 19,
//     fontWeight: "400",
//   },
//   errorSubtitle: {
//     fontSize: 16,
//     fontWeight: "300",
//   },
//   optionButton: {
//     paddingVertical: 16,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 12,
//   },
//   bottomSheetView: {
//     paddingTop: 24,
//     paddingBottom: 48,
//     paddingHorizontal: 36,
//   },
// });
