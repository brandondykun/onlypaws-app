import { View, StyleSheet } from "react-native";

import { ProfileDetails } from "@/types";
import { formatBirthdateToAge } from "@/utils/utils";

import InfoPill from "./InfoPill";

type Props = {
  profileData: ProfileDetails;
};

const ProfileAttributes = ({ profileData }: Props) => {
  return (
    <View style={s.root}>
      {profileData.pet_type ? <InfoPill text={profileData.pet_type.name} /> : null}
      {profileData.breed ? <InfoPill text={profileData.breed} /> : null}
      {profileData.sex ? <InfoPill text={profileData.sex} /> : null}
      {profileData.birthdate ? <InfoPill text={formatBirthdateToAge(profileData.birthdate)} /> : null}
      {profileData.weight != null ? <InfoPill text={`${profileData.weight} lbs`} /> : null}
      {profileData.energy_level ? <InfoPill text={`${profileData.energy_level} Energy`} /> : null}
      {profileData.anxiety_level ? <InfoPill text={`${profileData.anxiety_level} Anxiety`} /> : null}
    </View>
  );
};

export default ProfileAttributes;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
});
