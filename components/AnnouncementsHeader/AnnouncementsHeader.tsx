import { View, StyleSheet } from "react-native";

import { useAnnouncements } from "@/context/AnnouncementsContext";

import Announcement from "../Announcement/Announcement";

const AnnouncementsHeader = () => {
  const { announcements } = useAnnouncements();

  if (announcements.length === 0) {
    return null;
  }

  return (
    <View style={s.root}>
      {announcements.map((announcement) => (
        <Announcement key={announcement.id} announcement={announcement} />
      ))}
    </View>
  );
};

export default AnnouncementsHeader;

const s = StyleSheet.create({
  root: {
    gap: 12,
    marginBottom: 12,
  },
});
