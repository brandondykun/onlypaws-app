import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  NativeSyntheticEvent,
  View,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  GestureResponderEvent,
} from "react-native";
import Toast from "react-native-toast-message";

import { axiosFetch } from "@/api/config";
import { addComment, getPostComments } from "@/api/post";
import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PaginatedPostCommentsResponse, PostCommentDetailed } from "@/types";

import Button from "../Button/Button";
import Comment from "../Comment/Comment";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";
import TextInput from "../TextInput/TextInput";

type Props = {
  visible: boolean;
  onRequestClose: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  addCommentToPost: (comment: PostCommentDetailed) => void;
  postId: number | null;
};

const CommentsModal = ({ visible, onRequestClose, addCommentToPost, postId }: Props) => {
  // form state
  const [commentText, setCommentText] = useState("");
  const [addCommentLoading, setAddCommentLoading] = useState(false);
  // fetching data state
  const [comments, setComments] = useState<PostCommentDetailed[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 400, // Adjust duration as needed
        useNativeDriver: true,
        delay: isDarkMode ? 100 : 200,
      }).start();
    }

    return () => {
      fadeAnim.setValue(0);
    };
  }, [fadeAnim, visible, isDarkMode]);

  // initial fetch or refresh fetch if initial fetch fails
  const fetchComments = useCallback(async () => {
    if (postId) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { error, data } = await getPostComments(postId);
      if (!error && data) {
        setComments(data.results);
        setFetchNextUrl(data.next);
      } else {
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
      setRefreshing(false);
    }
  }, [postId]);

  // refresh comments fetch if user swipes down
  const refreshComments = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchComments();
    setRefreshing(false);
  };

  // perform initial comments fetch
  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [postId, visible, fetchComments]);

  // fetch next paginated list of comments
  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data } = await axiosFetch<PaginatedPostCommentsResponse>(fetchNextUrl);
      if (!error && data) {
        setComments((prev) => [...prev, ...data.results]);
        setFetchNextUrl(data.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl]);

  const handleAddComment = async () => {
    if (postId && commentText) {
      setAddCommentLoading(true);
      const { error, data } = await addComment(postId, commentText, authProfile.id);
      if (!error && data) {
        setComments((prev) => [data, ...prev]);
        setCommentText("");
        addCommentToPost(data);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error adding that comment.",
        });
      }
      setAddCommentLoading(false);
    }
  };

  const onClose = (e: GestureResponderEvent) => {
    onRequestClose && onRequestClose(e);
    setCommentText("");
  };

  // default state while initial fetch is running
  let content = (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 36,
        backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[100],
      }}
    >
      <ActivityIndicator size="large" color={COLORS.zinc[500]} />
    </View>
  );

  // content to show in flat list if data is empty
  const emptyComponent = hasInitialFetchError ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 36 }}>
      <Text style={{ textAlign: "center", color: COLORS.red[600] }}>
        There was an error fetching those comments. Swipe down to try again.
      </Text>
    </View>
  ) : !refreshing ? (
    <View style={{ padding: 48, flex: 1, justifyContent: "center", gap: 16 }}>
      <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]} style={{ textAlign: "center", fontSize: 20 }}>
        No comments yet.
      </Text>
      <Text style={{ color: COLORS.zinc[500], textAlign: "center", fontSize: 18, fontWeight: "300" }}>
        Add a comment to start the conversation!
      </Text>
    </View>
  ) : null;

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="small" />
    </View>
  ) : hasFetchNextError ? (
    <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 24 }}>
      <Text style={{ color: COLORS.red[600], textAlign: "center" }}>
        Oh no! There was an error fetching more comments.
      </Text>
      <Button text="Retry" variant="text" onPress={() => fetchNext()} />
    </View>
  ) : null;

  // once initial fetch is complete, show the flat list
  if (initialFetchComplete) {
    content = (
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.1} // Trigger when 10% from the bottom
        onEndReached={!fetchNextLoading ? () => fetchNext() : null}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshComments}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        renderItem={({ item }) => <Comment comment={item} />}
        ListFooterComponent={footerComponent}
      />
    );
  }

  return (
    <Modal visible={visible} withScroll={false} animationType="slide" transparent={true} raw style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <Animated.View style={[s.backgroundOpacity, { opacity: fadeAnim }]} />
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <View
            style={[
              s.modalContent,
              {
                backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[100],
              },
            ]}
          >
            <View style={{ position: "absolute", right: 12, top: 12, zIndex: 4 }}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                testID="comments-modal-close-button"
              >
                <AntDesign name="close" size={24} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[700]} />
              </Pressable>
            </View>
            <View
              style={[
                s.header,
                {
                  borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[200],
                },
              ]}
            >
              <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>Comments</Text>
            </View>
            <View style={{ flex: 1 }}>{content}</View>
            <View style={{ paddingHorizontal: 16, flexDirection: "row", gap: 8, paddingTop: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Add comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  inputStyle={{ borderRadius: 25, paddingHorizontal: 16 }}
                  placeholderTextColor={COLORS.zinc[500]}
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  { paddingTop: 6, opacity: pressed || addCommentLoading || !commentText ? 0.5 : 1 },
                ]}
                onPress={handleAddComment}
                disabled={addCommentLoading}
                testID="add-comment-button"
              >
                <View style={s.addCommentButton}>
                  {!addCommentLoading ? (
                    <AntDesign name="arrowup" size={24} color={COLORS.zinc[100]} />
                  ) : (
                    <ActivityIndicator size="small" color={COLORS.zinc[200]} />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
      <Toast config={toastConfig} />
    </Modal>
  );
};

export default CommentsModal;

const s = StyleSheet.create({
  backgroundOpacity: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.zinc[950],
    opacity: 0.5,
  },
  backgroundPressable: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    height: "80%",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingBottom: 16,
    paddingTop: 16,
    position: "relative",
  },
  header: {
    paddingTop: 2,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  addCommentButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.sky[600],
    width: 45,
    height: 45,
    borderRadius: 45,
  },
});
