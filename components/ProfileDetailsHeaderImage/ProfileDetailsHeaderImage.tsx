import { BlurView } from "expo-blur";
import { useState } from "react";
import { View, Dimensions, Pressable, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorMode } from "@/context/ColorModeContext";
import { ProfileImage as TProfileImage } from "@/types";

import Modal from "../Modal/Modal";
import ProfileImage from "../ProfileImage/ProfileImage";

type Props = {
  image: TProfileImage | null;
};
const ProfileDetailsHeaderImage = ({ image }: Props) => {
  const [visible, setVisible] = useState(false);

  const { isDarkMode } = useColorMode();

  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth - screenWidth / 5;

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <View>
      <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]} onPress={handleOpen}>
        <View>
          <ProfileImage image={image} size={100} />
        </View>
      </Pressable>
      <Modal
        visible={visible}
        onRequestClose={handleClose}
        raw
        withScroll={false}
        transparent={true}
        animationType="fade"
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose}>
          <BlurView intensity={10} style={[s.blurView, { backgroundColor: isDarkMode ? "#09090bb5" : "#18181bd4" }]}>
            <GestureHandlerRootView style={{ height: imageSize }}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <ProfileImage image={image} size={imageSize} />
              </Pressable>
            </GestureHandlerRootView>
          </BlurView>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ProfileDetailsHeaderImage;

const s = StyleSheet.create({
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
});
