import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { getCommentChain } from "@/api/interactions";
import Button from "@/components/Button/Button";
import MainComment from "@/components/Comment/MainComment";
import ReplyComment from "@/components/Comment/ReplyComment";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { CommentChainResponse } from "@/types/post/post";
import { ImageAspectRatio } from "@/types/post/post";

const CommentDetailsScreen = () => {
  const { commentId } = useLocalSearchParams<{ commentId: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDarkMode } = useColorMode();
  const scrollViewRef = useRef<ScrollView>(null);

  const [commentChain, setCommentChain] = useState<CommentChainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTagPopovers, setShowTagPopovers] = useState(false);

  const fetchCommentChain = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getCommentChain(commentId);
    if (data && !error) {
      setCommentChain(data);
    } else {
      setError(error || "Error fetching comment chain");
    }
    setLoading(false);
  }, [commentId]);

  useEffect(() => {
    fetchCommentChain();
  }, [commentId, fetchCommentChain]);

  // scroll to the bottom of the screen when the comment chain is loaded
  useEffect(() => {
    if (commentChain && scrollViewRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 20);
    }
  }, [commentChain]);

  const handleHeartPress = useCallback(() => {
    Toast.show({
      type: "info",
      text1: "Info",
      text2: "Sorry! You can't interact with comments from this screen yet.",
    });
  }, []);

  if (loading) return <Loading />;
  if (error || !commentChain) return <RetryErrorMessage fetchFn={fetchCommentChain} />;

  // check if the comment is a top level comment
  const isTopLevelComment = commentChain && commentChain?.root_parent_comment === null;

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <ImageSwiper
        images={commentChain.post?.images || []}
        aspectRatio={commentChain.post?.aspect_ratio || ("1:1" as ImageAspectRatio)}
        showTagPopovers={showTagPopovers}
        setShowTagPopovers={setShowTagPopovers}
        onTagsButtonPress={() => setShowTagPopovers((prev) => !prev)}
        handleCoordinatesPress={() => setShowTagPopovers((prev) => !prev)}
      />
      <View>
        {isTopLevelComment ? (
          <View style={{ marginTop: 12 }}>
            <MainComment
              comment={commentChain.target_comment}
              handleHeartPress={handleHeartPress}
              bgColor={isDarkMode ? COLORS.sky[975] : COLORS.sky[100]}
            />
          </View>
        ) : (
          <>
            <MainComment comment={commentChain.root_parent_comment!} handleHeartPress={handleHeartPress} />
            {commentChain.omitted_count > 0 ? (
              <OmittedCommentsMessage omittedCount={commentChain.omitted_count} />
            ) : null}
            {commentChain.parent_chain.map((comment) => {
              return (
                <ReplyComment
                  replyComment={comment}
                  handleLikeReply={handleHeartPress}
                  handleUnlikeReply={handleHeartPress}
                  key={comment.id}
                />
              );
            })}
            <ReplyComment
              replyComment={commentChain.target_comment}
              handleLikeReply={handleHeartPress}
              handleUnlikeReply={handleHeartPress}
              bgColor={isDarkMode ? COLORS.sky[975] : COLORS.sky[100]}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default CommentDetailsScreen;

const Loading = () => {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: tabBarHeight + 24,
      }}
    >
      <ActivityIndicator color={COLORS.zinc[500]} />
    </View>
  );
};

const RetryErrorMessage = ({ fetchFn }: { fetchFn: () => void }) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>We A-paw-logize!</Text>
      <Text style={{ fontSize: 16, color: setLightOrDark(COLORS.zinc[700], COLORS.zinc[400]) }}>
        There was an error fetching this comment.
      </Text>
      <Button
        text="Retry"
        onPress={fetchFn}
        variant="text"
        textStyle={{ color: COLORS.sky[600] }}
        icon={<Ionicons name="refresh-outline" size={18} color={COLORS.sky[600]} />}
        buttonStyle={{ marginTop: 12, marginLeft: -12 }}
      />
    </View>
  );
};

const OmittedCommentsMessage = ({ omittedCount }: { omittedCount: number }) => {
  const { setLightOrDark } = useColorMode();
  return (
    <Text
      style={{
        fontSize: 14,
        color: setLightOrDark(COLORS.zinc[700], COLORS.zinc[400]),
        textAlign: "center",
        marginVertical: 6,
      }}
    >
      - {omittedCount} more comments omitted -
    </Text>
  );
};
