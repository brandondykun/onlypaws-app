import { useLocalSearchParams, useRouter } from "expo-router";

import TaggedPostsList from "@/components/TaggedPostsList/TaggedPostsList";

const TaggedPostsListScreen = () => {
  const { initialIndex, profileId } = useLocalSearchParams<{ initialIndex: string; profileId: string }>();

  const router = useRouter();

  const onProfilePress = (publicId: string, username?: string) => {
    router.push({
      pathname: "/(app)/profile/profileDetails",
      params: { profileId: publicId, username: username },
    });
  };

  return <TaggedPostsList profileId={profileId} initialIndex={initialIndex} onProfilePress={onProfilePress} />;
};

export default TaggedPostsListScreen;
