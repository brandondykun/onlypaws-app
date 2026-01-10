import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { View, StyleSheet } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  isHidden: boolean;
  profileId: number;
  postId: number;
  isReported: boolean;
  onToggleHidden: (postId: number) => void;
};

const HiddenMessage = ({ isHidden, profileId, postId, isReported, onToggleHidden }: Props) => {
  const { authProfile } = useAuthProfileContext();
  const { isDarkMode } = useColorMode();

  if (!isHidden) return null;

  // Show this when user is looking at someone else's post and it has been reported
  if (profileId !== authProfile.id) {
    return (
      <BlurView
        intensity={90}
        style={[s.blurView, { backgroundColor: isDarkMode ? "#09090bb5" : "#d6d6dbb5" }]}
        testID={`post-${postId}-hidden-view`}
      >
        <Ionicons name="eye-off" size={42} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
        <Text style={s.reportedText} lightColor={COLORS.zinc[700]} darkColor={COLORS.zinc[500]}>
          {(isReported ? "You reported this post, " : "This post has been reported, ") + "so we hid it for you."}
        </Text>
        <Button
          text="Show Post"
          variant="text"
          onPress={() => onToggleHidden(postId)}
          textStyle={{ color: COLORS.sky[600] }}
          testID={`post-${postId}-show-post-button`}
        />
      </BlurView>
    );
  }

  // Show this when user is looking at their own post and it has been reported
  return (
    <View style={s.reportedMessageContainer}>
      <View style={[s.reportedMessage, { backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[50] }]}>
        <Ionicons name="alert-circle-outline" size={14} color={isDarkMode ? COLORS.red[600] : COLORS.red[500]} />
        <Text style={{ color: isDarkMode ? COLORS.red[600] : COLORS.red[500], fontSize: 15 }}>
          This post has been reported
        </Text>
        <Ionicons name="alert-circle-outline" size={14} color={isDarkMode ? COLORS.red[600] : COLORS.red[500]} />
      </View>
    </View>
  );
};

export default HiddenMessage;

const s = StyleSheet.create({
  blurView: {
    position: "absolute",
    top: 0,
    bottom: 18,
    right: 0,
    left: 0,
    backgroundColor: "red",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  reportedMessageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  reportedMessage: {
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    borderRadius: 10,
  },
  reportedText: {
    fontSize: 18,
    paddingHorizontal: 36,
    textAlign: "center",
    fontWeight: 300,
  },
});
