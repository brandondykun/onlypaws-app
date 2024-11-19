import { FlashList } from "@shopify/flash-list";
import { useRef } from "react";

import { PostDetailed } from "@/types";

import Post from "../Post/Post";
import { POST_HEIGHT } from "../Post/Post";

type Props = {
  posts: PostDetailed[];
  setPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  initialIndex?: number;
  onProfilePress: (profileId: number) => void;
  onLike?: (postId: number) => void;
  onUnlike?: (postId: number) => void;
  onComment?: (postId: number) => void;
};

const PostScrollList = ({ posts, setPosts, initialIndex, onProfilePress, onLike, onUnlike, onComment }: Props) => {
  const flatListRef = useRef<FlashList<PostDetailed>>(null);

  return (
    <FlashList
      ref={flatListRef}
      data={posts}
      renderItem={({ item }) => (
        <Post
          post={item}
          onProfilePress={onProfilePress}
          setPosts={setPosts}
          onLike={onLike}
          onUnlike={onUnlike}
          onComment={onComment}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      initialScrollIndex={initialIndex}
      estimatedItemSize={POST_HEIGHT}
    />
  );
};

export default PostScrollList;
