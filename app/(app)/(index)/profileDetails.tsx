import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const ProfileDetailsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/(index)/profileList", params: { initialIndex: index, profileId } });
  };

  return <ProfileDetails profileId={profileId} onPostPreviewPress={handlePostPreviewPress} />;
};

export default ProfileDetailsScreen;
