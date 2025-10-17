import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import ProfileImage from "@/components/ProfileImage/ProfileImage";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { usePostsProfileDetailsContext } from "@/context/PostsProfileDetailsContext";
import { DBNotification, WSNotification } from "@/types/notifications/base";
import { getTimeSince } from "@/utils/utils";

type Props = {
  item: DBNotification | WSNotification;
  index: number;
};

const NotificationListItem = ({ item, index }: Props) => {
  const router = useRouter();
  const { setProfileId } = usePostsProfileDetailsContext();
  const { markAsRead } = useNotificationsContext();

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

  // Handle notification press
  const handlePress = () => {
    if (isFollowNotification) {
      // Set the profile id to load the follower's profile
      setProfileId(item.extra_data.follower_id);
      // Mark the notification as read
      markAsRead(item.id.toString());
      // Navigate to the follower's profile
      router.push({ pathname: "/(app)/posts/profileDetails", params: { profileId: item.extra_data.follower_id } });
    }
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && isFollowNotification && { opacity: 0.7 }]}>
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
    </Pressable>
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
