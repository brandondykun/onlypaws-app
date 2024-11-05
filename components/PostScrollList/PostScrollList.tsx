import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef } from "react";
import { Dimensions } from "react-native";

import { PostDetailed } from "@/types";
import { PostLike, PostCommentDetailed } from "@/types";

import Post from "../Post/Post";

type Props = {
  posts: PostDetailed[];
  setPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  initialIndex?: number;
  onProfilePress: (profileId: number) => void;
  onLike?: (newPostLike: PostLike) => void;
  onUnlike?: (postId: number) => void;
  onComment?: (comment: PostCommentDetailed, postId: number) => void;
};

const PostScrollList = ({ posts, setPosts, initialIndex, onProfilePress, onLike, onUnlike, onComment }: Props) => {
  const flatListRef = useRef<FlashList<PostDetailed>>(null);

  const isFocused = useIsFocused();
  const screenWidth = Dimensions.get("window").width;
  const estimatedItemSize = screenWidth + 180;

  useEffect(() => {
    if (initialIndex) {
      setTimeout(() => {
        if (flatListRef?.current) {
          flatListRef.current.scrollToIndex({
            index: initialIndex,
            animated: true,
          });
        }
      }, 700);
    }
  }, [initialIndex, flatListRef, isFocused]);

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
      estimatedItemSize={estimatedItemSize}
    />
  );
};

export default PostScrollList;
