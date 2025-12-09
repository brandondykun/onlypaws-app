import { BlurView } from "expo-blur";
import { useState, useRef, useEffect } from "react";
import { View, Dimensions, Pressable, StyleSheet, Animated } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileImage as TProfileImage } from "@/types";
import { ImageAsset } from "@/types/post/post";

import Modal from "../Modal/Modal";
import ProfileImage from "../ProfileImage/ProfileImage";

type Props = {
  image: TProfileImage | ImageAsset | null;
  size?: number;
};
const ProfileDetailsHeaderImage = ({ image, size }: Props) => {
  const [visible, setVisible] = useState(false);
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const { isDarkMode, setLightOrDark } = useColorMode();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const imageSize = screenWidth - screenWidth / 5;
  const smallImageSize = size ? size : 100;

  const viewRef = useRef<View>(null);

  // Animated values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    // Measure the actual screen position before opening
    viewRef.current?.measureInWindow((x, y, width, height) => {
      setViewPosition({ x, y, width, height });
      setVisible(true);
    });
  };

  const handleClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      // Calculate starting position (from small image to center of screen)
      const startX = viewPosition.x + viewPosition.width / 2 - screenWidth / 2;
      const startY = viewPosition.y + viewPosition.height / 2 - screenHeight / 2;
      const startScale = smallImageSize / imageSize;

      // Set initial values
      translateX.setValue(startX);
      translateY.setValue(startY);
      scale.setValue(startScale);
      opacity.setValue(1);

      // Animate to final position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
    }
  }, [
    visible,
    viewPosition,
    screenWidth,
    screenHeight,
    imageSize,
    smallImageSize,
    opacity,
    scale,
    translateX,
    translateY,
  ]);

  return (
    <View ref={viewRef}>
      <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]} onPress={handleOpen}>
        <View
          style={{
            borderColor: setLightOrDark(COLORS.sky[500], COLORS.sky[500]),
            borderWidth: 3,
            borderRadius: 100,
          }}
        >
          <View
            style={{
              borderColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
              borderWidth: 1,
              borderRadius: 100,
            }}
          >
            <ProfileImage image={image} size={size ? size : 100} />
          </View>
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
          <BlurView
            intensity={10}
            style={[s.blurView, { backgroundColor: isDarkMode ? `${COLORS.zinc[950]}b5` : `${COLORS.zinc[900]}d4` }]}
          >
            <GestureHandlerRootView style={{ height: imageSize }}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  style={{
                    transform: [{ translateX }, { translateY }, { scale }],
                    opacity,
                  }}
                  testID="profile-image-preview-modal"
                >
                  <ProfileImage image={image} size={imageSize} />
                </Animated.View>
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
