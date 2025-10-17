import { Image } from "expo-image";
import React from "react";
import { View, StyleSheet } from "react-native";

import ProfileImage from "@/components/ProfileImage/ProfileImage";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { DBNotification } from "@/types/notifications/base";
import { WSPostLikeNotification } from "@/types/notifications/post-like";
import { getTimeSince } from "@/utils/utils";

type Props = {
  item: DBNotification | WSPostLikeNotification;
  index: number;
};

const NotificationListItem = ({ item, index }: Props) => {
  const senderImage = "sender" in item ? item.sender.image?.image : item.sender_avatar;
  const senderUsername = "sender" in item ? item.sender.username : item.sender_username;

  // Determine if the notification is a follow notification
  const isFollowNotification = "notification_type" in item && item.notification_type === "follow";

  // if there is a post preview image to display on the right side of the notification
  // if it is a follow notification, there is no post preview image
  const postImagePreview = isFollowNotification
    ? null
    : item.extra_data.post_preview_image
      ? item.extra_data.post_preview_image
      : null;

  return (
    <View style={s.root}>
      {item.is_read ? null : <View style={s.notificationIndicator} />}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {senderImage ? <ProfileImage image={senderImage} size={28} /> : null}
          <Text style={{ fontSize: 22, fontWeight: "400" }}>{senderUsername}</Text>
        </View>
        <View style={{ gap: 8, flexDirection: "row", alignItems: "flex-end" }}>
          <View>
            <Text
              style={{ fontSize: 16, fontWeight: "400" }}
              darkColor={COLORS.zinc[400]}
              lightColor={COLORS.zinc[700]}
            >
              {item.title}
            </Text>
          </View>
          <View>
            <Text
              darkColor={COLORS.zinc[500]}
              lightColor={COLORS.zinc[600]}
              style={{ fontSize: 16, fontWeight: "300" }}
            >
              {getTimeSince(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
      <View>
        {postImagePreview ? (
          <Image source={{ uri: postImagePreview }} style={{ width: 50, height: 50, borderRadius: 6 }} />
        ) : null}
      </View>
    </View>
  );
};

export default NotificationListItem;

const s = StyleSheet.create({
  root: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "relative",
  },
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
