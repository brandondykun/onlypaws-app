import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState, useCallback } from "react";
import { StyleSheet, View, ActivityIndicator, useWindowDimensions } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { Camera, useCameraDevice, useCameraPermission, Point, useCameraFormat } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";

import CameraBackground from "@/components/Camera/CameraBackground/CameraBackground";
import CameraFooter from "@/components/Camera/CameraFooter/CameraFooter";
import CameraHeader from "@/components/Camera/CameraHeader/CameraHeader";
import FocusIcon from "@/components/Camera/FocusIcon/FocusIcon";
import NoCameraDevice from "@/components/Camera/NoCameraDevice/NoCameraDevice";
import RequestCameraPermission from "@/components/Camera/RequestCameraPermission/RequestCameraPermission";
import { COLORS } from "@/constants/Colors";
import { useAddPostContext } from "@/context/AddPostContext";
import { useColorMode } from "@/context/ColorModeContext";

// Max images for a post
const MAX_IMAGES = 5;

const CameraScreen = () => {
  const { images, setImages, resetState, setAspectRatio, aspectRatio } = useAddPostContext();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { setLightOrDark } = useColorMode();

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [imageChangeLoading, setImageChangeLoading] = useState(false);

  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null!);
  const device = useCameraDevice(facing);

  // Select the desired format
  const format = useCameraFormat(device, [
    // Swap width and height because cameras are in landscape orientation
    { videoAspectRatio: screenHeight / screenWidth }, // Target the screen's aspect ratio
  ]);

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
          // Initialize the image asset object with an empty tags array
          setImages((prev) => [{ ...newImage, id: `${Date.now()}-0`, tags: [] }, ...prev]);
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
      const newAddPostImages = result.assets.map((asset, index) => ({
        ...asset,
        id: `${Date.now()}-${index}`,
        tags: [], // Initialize the image asset object with an empty tags array
      }));
      setImages((prev) => [...newAddPostImages, ...prev]);
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
    scheduleOnRN(focus, { x, y });
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

  // get the aspect ratio of the camera preview container
  const previewAspectRatio = format?.photoWidth ? format.photoWidth / format.photoHeight : 1;
  // get the total vertical space not taken by the camera preview container
  const totalVerticalPadding = screenHeight - screenWidth * previewAspectRatio;
  // divide the total vertical padding by 2 to get the top and bottom padding
  const paddingGap = totalVerticalPadding / 2;
  // the padding gap is the same for the top and bottom because the preview image container is centered vertically

  if (device && hasPermission && isFocused) {
    const maxImagesReached = images.length === MAX_IMAGES;

    content = (
      <GestureHandlerRootView>
        <View style={{ flex: 1, position: "relative" }}>
          <CameraBackground aspectRatio={aspectRatio} />

          {/* Top */}
          <CameraHeader
            handleBackButtonPress={handleBackButtonPress}
            toggleFlash={toggleFlash}
            flash={flash}
            toggleCameraFacing={toggleCameraFacing}
            setAspectRatio={setAspectRatio}
            aspectRatio={aspectRatio}
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
          <View style={[s.cameraLayout, { top: paddingGap, bottom: paddingGap }]}>
            <GestureDetector gesture={gesture}>
              <Camera
                style={s.camera}
                ref={cameraRef}
                format={format}
                device={device}
                isActive={isFocused}
                photo={true}
                enableZoomGesture={true}
                resizeMode="contain"
              />
            </GestureDetector>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[s.contentContainer, { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[950]) }]}>
        {content}
      </View>
    </View>
  );
};

export default CameraScreen;

const s = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.zinc[900],
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraLayout: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 20,
    overflow: "hidden",
  },
});
