import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { View, Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAnnouncements } from "@/context/AnnouncementsContext";
import { useColorMode } from "@/context/ColorModeContext";
import { Announcement as TAnnouncement } from "@/types/announcements/announcements";

import Text from "../Text/Text";

type Props = {
  announcement: TAnnouncement;
};

const Announcement = ({ announcement }: Props) => {
  const { setLightOrDark } = useColorMode();
  const { dismissAnnouncement } = useAnnouncements();

  const handleClose = () => {
    Haptics.impactAsync();
    dismissAnnouncement(announcement.id);
  };

  return (
    <View
      style={{
        backgroundColor: setLightOrDark(COLORS.sky[50], `${COLORS.sky[950]}99`),
        borderColor: setLightOrDark(COLORS.sky[200], COLORS.sky[900]),
        ...s.root,
      }}
    >
      <Pressable
        style={({ pressed }) => [s.closeButton, pressed && s.pressed]}
        onPress={handleClose}
        hitSlop={15}
        testID={`announcement-close-button-${announcement.id}`}
      >
        <Ionicons name="close" size={22} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[200])} />
      </Pressable>
      <Text style={s.title}>{announcement.title}</Text>
      <Text style={{ color: setLightOrDark(COLORS.zinc[950], COLORS.zinc[300]) }}>{announcement.message}</Text>
    </View>
  );
};

export default Announcement;

const s = StyleSheet.create({
  root: {
    borderWidth: 1,
    gap: 10,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 12,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
