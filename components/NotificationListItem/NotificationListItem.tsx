import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { useNotificationsContext } from "@/context/NotificationsContext";
import { DBNotification, WSNotification } from "@/types/notifications/base";

import Description from "./components/Description";
import ProfileImageAndUsername from "./components/ProfileImageAndUsername";
import UnreadIndicator from "./components/UnreadIndicator";

type Props = {
  item: DBNotification | WSNotification;
  index: number;
};

const NotificationListItem = ({ item, index }: Props) => {
  const router = useRouter();
  const { markAsRead } = useNotificationsContext();

  const senderImage = "sender" in item ? item.sender.image?.image : item.sender_avatar;
  const senderUsername = "sender" in item ? item.sender.username : item.sender_username;

  // Determine if the notification is a follow notification
  const isFollowNotification = "notification_type" in item && item.notification_type === "follow";

  // if there is a post preview image to display on the right side of the notification
  // if it is a follow notification, there is no post preview image
  const postImagePreview = isFollowNotification
    ? null
    : "post_preview_image" in item.extra_data
      ? item.extra_data.post_preview_image
      : null;

  // Handle notification press
  const handlePress = () => {
    if (isFollowNotification) {
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
    } else if (item.notification_type === "tagged_post") {
      // Mark the notification as read
      if (!item.is_read) markAsRead(item.id.toString());
      // Navigate to the post details
      router.push({ pathname: "/(app)/posts/postDetails", params: { postId: item.extra_data.post_id } });
    } else if (item.notification_type === "follow_request_accepted") {
      if (!item.is_read) markAsRead(item.id.toString()); // Mark the notification as read
      // Navigate to the profile details
      router.push({
        pathname: "/(app)/posts/profileDetails",
        params: { profileId: item.extra_data.followed_id, username: item.extra_data.followed_username },
      });
    }
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && { opacity: 0.7 }, s.root]}>
      <UnreadIndicator isRead={item.is_read} id={item.id} />
      <View style={s.imageAndDescriptionContainer}>
        <ProfileImageAndUsername profileImage={senderImage} username={senderUsername} />
        <Description title={item.title} createdAt={item.created_at} />
      </View>
      {postImagePreview && <Image source={{ uri: postImagePreview }} style={s.previewImage} />}
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
  imageAndDescriptionContainer: {
    flex: 1,
    overflow: "hidden",
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
});
