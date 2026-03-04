import { router, useLocalSearchParams } from "expo-router";

import FollowingScreen from "@/components/FollowingScreen/FollowingScreen";

const ExploreTabFollowingScreen = () => {
  const { profileId, username } = useLocalSearchParams<{ profileId: string; username?: string }>();

  const handleProfilePress = (publicId: string, username?: string) => {
    router.push({
      pathname: "/(app)/explore/profileDetails",
      params: { profileId: publicId, username },
    });
  };

  return <FollowingScreen onProfilePress={handleProfilePress} profileId={profileId} username={username} />;
};

export default ExploreTabFollowingScreen;
