import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Pressable, View, StyleSheet } from "react-native";

import ProfileImage from "@/components/ProfileImage/ProfileImage";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileImage as TProfileImage } from "@/types";

type Props = {
  visible: boolean;
  profileImage: TProfileImage | null;
  username: string | null;
  hasPressAction: boolean;
  postId: number;
  handleProfilePress: () => void;
  openPostMenu: () => void;
};

const PostHeader = ({
  visible,
  profileImage,
  username,
  hasPressAction,
  postId,
  handleProfilePress,
  openPostMenu,
}: Props) => {
  const { isDarkMode } = useColorMode();

  if (!visible) return null;

  return (
    <View style={s.root}>
      <View style={s.imageAndUsernameContainer}>
        <ProfileImage image={profileImage} size={35} />
        <Pressable
          style={({ pressed }) => [pressed && hasPressAction && { opacity: 0.7 }]}
          onPress={handleProfilePress}
          hitSlop={10}
          testID={`post-username-button-${postId}`}
        >
          <Text darkColor={COLORS.zinc[300]} style={s.usernameText}>
            {username}
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.6 }, s.menuButton]}
        hitSlop={8}
        onPress={openPostMenu}
        testID={`post-menu-button-${postId}`}
      >
        <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]} />
      </Pressable>
    </View>
  );
};

export default PostHeader;

const s = StyleSheet.create({
  root: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageAndUsernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  usernameText: {
    fontSize: 20,
    textDecorationLine: "underline",
  },
  menuButton: {
    marginRight: 4,
  },
});
