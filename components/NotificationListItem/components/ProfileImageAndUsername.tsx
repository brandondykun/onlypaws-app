import { View, StyleSheet } from "react-native";

import ProfileImage from "@/components/ProfileImage/ProfileImage";
import Text from "@/components/Text/Text";

type Props = {
  profileImage: string | null | undefined;
  username: string | null;
};

const ProfileImageAndUsername = ({ profileImage, username }: Props) => {
  return (
    <View style={s.root}>
      <ProfileImage image={profileImage || null} size={28} />
      <Text style={s.username} numberOfLines={1}>
        {username ? username : "A User"}
      </Text>
    </View>
  );
};

export default ProfileImageAndUsername;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  username: {
    fontSize: 22,
    fontWeight: "400",
  },
});
