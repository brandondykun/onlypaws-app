import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View, StyleSheet } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  onMarkAllAsReadPress: () => void;
  unreadCount: number;
  markAllAsReadLoading?: boolean;
};

const NotificationsScreenHeader = ({ onMarkAllAsReadPress, unreadCount, markAllAsReadLoading = false }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View style={[s.root, { borderBottomColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Ionicons
          name="notifications"
          size={24}
          color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[200])}
          style={{ opacity: unreadCount > 0 ? 1 : 0.5 }}
        />
        {unreadCount > 0 ? (
          <View style={s.notificationsCountIcon}>
            <Text
              style={{ fontSize: 12, fontWeight: "600" }}
              lightColor={COLORS.zinc[100]}
              testID={`notifications-count-text-${unreadCount}`}
            >
              {unreadCount > 999 ? "999+" : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
      <View>
        {unreadCount > 0 ? (
          <Button
            text="Mark all as read"
            onPress={onMarkAllAsReadPress}
            loading={markAllAsReadLoading}
            disabled={markAllAsReadLoading}
            buttonStyle={{ paddingHorizontal: 12, height: 30, borderRadius: 100 }}
            textStyle={{ fontSize: 14 }}
          />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{ color: setLightOrDark(COLORS.zinc[900], COLORS.zinc[100]), fontSize: 18, fontWeight: "400" }}
            >
              Up to date!
            </Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={28}
              color={setLightOrDark(COLORS.lime[600], COLORS.lime[500])}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default NotificationsScreenHeader;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    height: 55,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  notificationsCountIcon: {
    backgroundColor: COLORS.red[500],
    minWidth: 22,
    height: 22,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
});
