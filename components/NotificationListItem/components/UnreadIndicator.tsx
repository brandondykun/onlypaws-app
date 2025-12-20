import { StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/Colors";

type Props = {
  isRead: boolean;
  id: number;
};

const UnreadIndicator = ({ isRead, id }: Props) => {
  if (isRead) return null;
  return <View style={s.notificationIndicator} testID={`notification-indicator-${id}`} />;
};

export default UnreadIndicator;

const s = StyleSheet.create({
  notificationIndicator: {
    position: "absolute",
    top: 13,
    left: -2,
    width: 10,
    height: 10,
    backgroundColor: COLORS.red[500],
    borderRadius: 100,
    zIndex: 10,
  },
});
