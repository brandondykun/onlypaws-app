import { useLocalSearchParams, useRouter } from "expo-router";

import TaggedPostsList from "@/components/TaggedPostsList/TaggedPostsList";

const TaggedPostsListScreen = () => {
  const { initialIndex, profileId } = useLocalSearchParams<{ initialIndex: string; profileId: string }>();

  const router = useRouter();

  const onProfilePress = (profileId: string, username?: string) => {
    router.push({
      pathname: "/(app)/posts/profileDetails",
      params: { profileId: profileId, username: username },
    });
  };

  return <TaggedPostsList profileId={profileId} initialIndex={initialIndex} onProfilePress={onProfilePress} />;
};

export default TaggedPostsListScreen;
