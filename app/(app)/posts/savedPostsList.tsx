import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useSavedPostsContext } from "@/context/SavedPostsContext";

const SavedPostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { data } = useSavedPostsContext();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  useEffect(() => {
    if (!data.length) {
      router.back();
    }
  }, [data, router]);

  return <PostScrollList posts={data} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default SavedPostsListScreen;
