import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState, useCallback } from "react";
import React from "react";
import { StyleSheet, View, ActivityIndicator, useWindowDimensions } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { Camera, useCameraDevice, useCameraPermission, Point } from "react-native-vision-camera";

import CameraBackground from "@/components/Camera/CameraBackground/CameraBackground";
import CameraFooter from "@/components/Camera/CameraFooter/CameraFooter";
import CameraHeader from "@/components/Camera/CameraHeader/CameraHeader";
import FocusIcon from "@/components/Camera/FocusIcon/FocusIcon";
import NoCameraDevice from "@/components/Camera/NoCameraDevice/NoCameraDevice";
import RequestCameraPermission from "@/components/Camera/RequestCameraPermission/RequestCameraPermission";
import { COLORS } from "@/constants/Colors";
import { useAddPostContext } from "@/context/AddPostContext";

// Max images for a post
const MAX_IMAGES = 5;

const CameraScreen = () => {
  const { images, setImages, resetState } = useAddPostContext();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [imageChangeLoading, setImageChangeLoading] = useState(false);

  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null!);
  const device = useCameraDevice(facing);

  const onNextButtonPress = () => {
    router.push("/(app)/add/editImages");
  };

  const takePicture = async () => {
    if (cameraRef?.current) {
      if (images.length < MAX_IMAGES) {
        setImageChangeLoading(true);
        const newImage = await cameraRef.current.takePhoto({
          flash: flash,
        });
        if (newImage) {
          setImages((prev) => [newImage, ...prev]);
        }
        setImageChangeLoading(false);
      }
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    setImageChangeLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length, // limit the number of images that can be selected
    });

    if (result.canceled) {
      setImageChangeLoading(false);
      return;
    }

    if (!result.canceled) {
      setImages((prev) => [...result.assets, ...prev]);
      setImageChangeLoading(false);
    }
  };

  // focus camera on point
  const focus = useCallback(
    (point: Point) => {
      const c = cameraRef.current;
      if (c == null) return;
      // prevent tap on screen outside of image from triggering focus
      const topLimit = (screenHeight - screenWidth) / 2;
      const bottomLimit = (screenHeight - screenWidth) / 2 + screenWidth;
      if (point.y < topLimit || point.y > bottomLimit) return;

      setFocusPoint({ x: point.x, y: point.y });
      c.focus(point)
        .catch(() => {
          // this is to avoid development error if focus is called multiple times quickly
        })
        .finally(() => {
          setFocusPoint(null);
        });
    },
    [screenHeight, screenWidth],
  );

  // handle tap to focus
  const gesture = Gesture.Tap().onEnd(({ x, y }) => {
    runOnJS(focus)({ x, y });
  });

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={COLORS.zinc[500]} />
    </View>
  );

  if (device == null) {
    // No camera device found
    content = <NoCameraDevice onBackButtonPress={() => router.back()} />;
  }

  if (!hasPermission) {
    // Camera permissions are not granted yet.
    content = <RequestCameraPermission requestPermission={requestPermission} />;
  }

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "on" ? "off" : "on"));
  };

  const handleBackButtonPress = () => {
    resetState();
    router.back();
  };

  if (device && hasPermission && isFocused) {
    const maxImagesReached = images.length === MAX_IMAGES;

    content = (
      <GestureHandlerRootView>
        <View style={{ flex: 1, position: "relative" }}>
          <CameraBackground />

          {/* Top */}
          <CameraHeader
            handleBackButtonPress={handleBackButtonPress}
            toggleFlash={toggleFlash}
            flash={flash}
            toggleCameraFacing={toggleCameraFacing}
          />

          {/* Camera Square */}

          {/* Bottom */}
          <CameraFooter
            screenHeight={screenHeight}
            screenWidth={screenWidth}
            maxImagesReached={maxImagesReached}
            MAX_IMAGES={MAX_IMAGES}
            images={images}
            pickImage={pickImage}
            takePicture={takePicture}
            onNextButtonPress={onNextButtonPress}
            imageChangeLoading={imageChangeLoading}
          />
          {focusPoint ? <FocusIcon focusPoint={focusPoint} /> : null}
          <View style={[s.cameraContainer, { width: screenWidth, height: screenWidth }]}>
            <GestureDetector gesture={gesture}>
              <Camera
                style={s.camera}
                ref={cameraRef}
                device={device}
                isActive={isFocused}
                photo={true}
                enableZoomGesture={true}
                resizeMode="cover"
              />
            </GestureDetector>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={s.contentContainer}>{content}</View>
    </View>
  );
};

export default CameraScreen;

const s = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  camera: {
    position: "relative",
    flex: 1,
  },
});
