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
      if (!item.is_read) markAsRead(item.id.toString());
      // Navigate to the follower's profile
      router.push({ pathname: "/(app)/posts/profileDetails", params: { profileId: item.extra_data.follower_id } });
    } else if (item.notification_type === "like_post") {
      // Mark the notification as read
      if (!item.is_read) markAsRead(item.id.toString());
      // Navigate to the post details
      router.push({ pathname: "/(app)/posts/postDetails", params: { postId: item.extra_data.post_id } });
    } else if (item.notification_type === "like_comment") {
      // Mark the notification as read
      if (!item.is_read) markAsRead(item.id.toString());
      // Navigate to the comment details
      router.push({ pathname: "/(app)/posts/commentDetails", params: { commentId: item.extra_data.comment_id } });
    } else if (item.notification_type === "comment") {
      // Mark the notification as read
      if (!item.is_read) markAsRead(item.id.toString());
      // Navigate to the comment details
      router.push({ pathname: "/(app)/posts/commentDetails", params: { commentId: item.extra_data.comment_id } });
    } else if (item.notification_type === "comment_reply") {
      // Mark the notification as read
      if (!item.is_read) markAsRead(item.id.toString());
      // Navigate to the comment details
      router.push({ pathname: "/(app)/posts/commentDetails", params: { commentId: item.extra_data.comment_id } });
    }
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
      <View style={s.root}>
        {item.is_read ? null : <View style={s.notificationIndicator} />}
        <View style={{ flex: 1, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <ProfileImage image={senderImage || null} size={28} />
            <Text style={{ fontSize: 22, fontWeight: "400" }} numberOfLines={1}>
              {senderUsername}
            </Text>
          </View>
          <View style={{ gap: 6, flexDirection: "row", alignItems: "flex-end" }}>
            <View>
              <Text style={s.title} numberOfLines={1} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[950]}>
                {item.title}
              </Text>
            </View>
            <View>
              <Text darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
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
  title: {
    fontSize: 15,
    fontWeight: "400",
    wordWrap: "nowrap",
  },
});
