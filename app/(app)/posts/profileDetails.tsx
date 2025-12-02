import { useLocalSearchParams, useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const PostsProfileDetailsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/posts/profilePostsList", params: { initialIndex: index, profileId } });
  };

  return <ProfileDetails profileId={profileId} onPostPreviewPress={handlePostPreviewPress} />;
};

export default PostsProfileDetailsScreen;
