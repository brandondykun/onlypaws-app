import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, Pressable, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { TextInput as RNGHTextInput } from "react-native-gesture-handler";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostCommentDetailed } from "@/types";

import { BottomSheetTextInput, DARK_BORDER_COLOR } from "../../BottomSheet/BottomSheet";
import Text from "../../Text/Text";

export type CommentInputFooterRef = {
  focus: () => void;
  clear: () => void;
};

type Props = {
  replyToComment: PostCommentDetailed | null;
  parentComment: PostCommentDetailed | null;
  onClearReply: () => void;
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
};

const CommentInputFooter = forwardRef<CommentInputFooterRef, Props>(
  ({ replyToComment, parentComment, onClearReply, onSubmit, isSubmitting }, ref) => {
    const { isDarkMode, setLightOrDark } = useColorMode();
    const commentInputRef = useRef<RNGHTextInput>(null);
    const inputValueRef = useRef("");

    const [inputHasText, setInputHasText] = useState(false);
    const [inputIsFocused, setInputIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => {
        commentInputRef.current?.focus();
      },
      clear: () => {
        commentInputRef.current?.clear();
        inputValueRef.current = "";
        setInputHasText(false);
      },
    }));

    const handleSubmit = async () => {
      if (inputValueRef.current) {
        await onSubmit(inputValueRef.current);
      }
    };

    const handleClearInput = () => {
      commentInputRef.current?.clear();
      inputValueRef.current = "";
      setInputHasText(false);
    };

    const handleBlur = () => {
      if (!inputValueRef.current) {
        onClearReply();
      }
      setInputIsFocused(false);
    };

    return (
      <View
        style={{
          paddingBottom: Platform.OS === "ios" ? 24 : 18,
          borderTopColor: isDarkMode ? DARK_BORDER_COLOR : `${COLORS.zinc[400]}80`,
          borderTopWidth: 1,
        }}
      >
        <View>
          {parentComment ? (
            <View style={{ paddingTop: 12 }}>
              <Text darkColor={COLORS.sky[500]} lightColor={COLORS.sky[600]} style={{ paddingHorizontal: 18 }}>
                replying to @{replyToComment?.profile?.username}: <Text>{replyToComment?.text}</Text>
              </Text>
            </View>
          ) : null}
        </View>
        <View style={[s.footerInputContainer, { paddingBottom: inputIsFocused ? 0 : 16 }]}>
          <View style={{ flex: 1 }}>
            <BottomSheetTextInput
              placeholder={replyToComment ? `Reply to @${replyToComment.profile.username}...` : "Add comment..."}
              ref={commentInputRef}
              defaultValue={inputValueRef.current}
              onChangeText={(text) => {
                inputValueRef.current = text;
                setInputHasText(!!text);
              }}
              onBlur={handleBlur}
              onFocus={() => setInputIsFocused(true)}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
              style={{
                minHeight: inputIsFocused ? 110 : undefined,
                backgroundColor: setLightOrDark(COLORS.zinc[125], COLORS.zinc[800]),
                borderRadius: inputIsFocused ? 16 : 25,
              }}
            />
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
            {inputIsFocused && inputHasText ? (
              <Pressable
                style={({ pressed }) => [{ opacity: pressed || isSubmitting || !inputHasText ? 0.5 : 1, marginTop: 4 }]}
                onPress={handleClearInput}
                disabled={isSubmitting || !inputHasText}
                testID="clear-comment-input-button"
                hitSlop={12}
              >
                <View style={[s.clearButton, { backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[300]) }]}>
                  <Ionicons
                    name="backspace-outline"
                    size={16}
                    color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[800])}
                  />
                </View>
              </Pressable>
            ) : null}
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed || isSubmitting ? 0.5 : 1 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                testID="add-comment-button"
              >
                <View style={s.addCommentButton}>
                  {!isSubmitting ? (
                    <Ionicons name="arrow-up-outline" size={24} color={COLORS.zinc[100]} />
                  ) : (
                    <ActivityIndicator size="small" color={COLORS.zinc[200]} />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

CommentInputFooter.displayName = "CommentInputFooter";
export default CommentInputFooter;

const s = StyleSheet.create({
  addCommentButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.sky[600],
    width: 45,
    height: 45,
    borderRadius: 45,
  },
  footerInputContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
  },
  clearButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 26,
    height: 26,
    borderRadius: 25,
  },
});
