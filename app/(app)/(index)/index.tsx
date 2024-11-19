import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { View, ActivityIndicator, RefreshControl } from "react-native";

import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import Post from "@/components/Post/Post";
import { POST_HEIGHT } from "@/components/Post/Post";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useFeedPostsContext } from "@/context/FeedPostsContext";
import { useProfileDetailsContext } from "@/context/ProfileDetailsContext";

const FeedScreen = () => {
  const feed = useFeedPostsContext();
  const profile = useProfileDetailsContext(); // selected profile in this stack

  const handleProfilePress = (profileId: number | string) => {
    profile.setProfileId(Number(profileId));
    router.push({ pathname: "/(app)/(index)/profileDetails", params: { profileId } });
  };

  const onLike = (postId: number) => {
    // update feed posts
    feed.onLike(postId);
    // update selected profile posts in ProfileDetailsContextProvider for this stack
    profile.posts.onLike(postId);
  };

  const onUnlike = (postId: number) => {
    // update feed posts
    feed.onUnlike(postId);
    // update selected profile posts in ProfileDetailsContextProvider for this stack
    profile.posts.onUnlike(postId);
  };

  const onComment = (postId: number) => {
    // update feed posts
    feed.onComment(postId);
    // update selected profile posts in ProfileDetailsContextProvider for this stack
    profile.posts.onComment(postId);
  };

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text>Loading Posts...</Text>
      <ActivityIndicator color={COLORS.zinc[500]} size="large" />
    </View>
  );

  const emptyComponent = (
    <View style={{ flex: 1, justifyContent: "center", paddingTop: "50%" }}>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          paddingHorizontal: 36,
          fontWeight: "300",
        }}
        darkColor={COLORS.zinc[400]}
        lightColor={COLORS.zinc[600]}
      >
        Oh no! Your feed is empty. Follow some users to see their posts here!
      </Text>
    </View>
  );

  if (feed.initialFetchComplete) {
    content = (
      <FlashList
        data={feed.data}
        showsVerticalScrollIndicator={false}
        refreshing={feed.refreshing}
        refreshControl={
          <RefreshControl
            refreshing={feed.refreshing}
            onRefresh={feed.refresh}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        renderItem={({ item }) => (
          <Post
            post={item}
            onProfilePress={handleProfilePress}
            setPosts={feed.setData}
            onLike={onLike}
            onUnlike={onUnlike}
            onComment={onComment}
          />
        )}
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
        estimatedItemSize={POST_HEIGHT}
      />
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

export default FeedScreen;
