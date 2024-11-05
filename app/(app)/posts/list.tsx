import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { usePostsContext } from "@/context/PostsContext";

const PostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { data, setData } = usePostsContext();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  return (
    <PostScrollList
      posts={data}
      onProfilePress={onProfilePress}
      initialIndex={Number(initialIndex)}
      setPosts={setData}
    />
  );
};

export default PostsListScreen;
