import { View, StyleSheet } from "react-native";

import { ProfileDetails } from "@/types";

import InfoPill from "./InfoPill";

type Props = {
  profileData: ProfileDetails;
};

const ProfileAttributes = ({ profileData }: Props) => {
  return (
    <View style={s.root}>
      {profileData.pet_type ? <InfoPill text={profileData.pet_type.name} /> : null}
      {profileData.breed ? <InfoPill text={profileData.breed} /> : null}
    </View>
  );
};

export default ProfileAttributes;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
});
