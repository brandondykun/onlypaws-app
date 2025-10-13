import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useRef } from "react";

import { PostDetailed } from "@/types";

import Post from "../Post/Post";

type Props = {
  posts: PostDetailed[];
  initialIndex?: number;
  onProfilePress: (profileId: number) => void;
};

const PostScrollList = ({ posts, initialIndex, onProfilePress }: Props) => {
  const flatListRef = useRef<FlashListRef<PostDetailed>>(null);
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <FlashList
      ref={flatListRef}
      data={posts}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      renderItem={({ item }) => <Post post={item} onProfilePress={onProfilePress} />}
      keyExtractor={(item) => item.id.toString()}
      initialScrollIndex={initialIndex}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PostScrollList;
