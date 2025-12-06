import { useLocalSearchParams, useRouter } from "expo-router";

import TaggedPostsList from "@/components/TaggedPostsList/TaggedPostsList";

const TaggedPostsListScreen = () => {
  const { initialIndex, profileId } = useLocalSearchParams<{ initialIndex: string; profileId: string }>();

  const router = useRouter();

  const onProfilePress = (profileId: number) => {
    router.push({ pathname: "/(app)/explore/profileDetails", params: { profileId: profileId.toString() } });
  };

  return <TaggedPostsList profileId={profileId} initialIndex={initialIndex} onProfilePress={onProfilePress} />;
};

export default TaggedPostsListScreen;
