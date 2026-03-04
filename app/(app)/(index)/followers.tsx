import { router, useLocalSearchParams } from "expo-router";

import FollowersScreen from "@/components/FollowersScreen/FollowersScreen";

const FeedTabFollowersScreen = () => {
  const { profileId, username } = useLocalSearchParams<{ profileId: string; username?: string }>();

  const handleProfilePress = (publicId: string, username?: string) => {
    router.push({
      pathname: "/(app)/(index)/profileDetails",
      params: { profileId: publicId, username },
    });
  };

  return <FollowersScreen onProfilePress={handleProfilePress} profileId={profileId} username={username} />;
};

export default FeedTabFollowersScreen;
