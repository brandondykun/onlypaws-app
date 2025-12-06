import { useLocalSearchParams, useRouter } from "expo-router";

import TaggedPosts from "@/components/TaggedPosts/TaggedPosts";

const TaggedPostsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({
      pathname: "/(app)/posts/taggedPostsList",
      params: { initialIndex: index.toString(), profileId: profileId },
    });
  };

  return <TaggedPosts profileId={profileId} onPostPreviewPress={handlePostPreviewPress} />;
};

export default TaggedPostsScreen;
