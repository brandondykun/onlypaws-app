import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState, useCallback } from "react";
import React from "react";
import { StyleSheet, useWindowDimensions, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import * as ImageCropPicker from "react-native-image-crop-picker";
import { runOnJS } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Camera, useCameraDevice, useCameraPermission, Point, PhotoFile } from "react-native-vision-camera";

import { addProfileImage, editProfileImage } from "@/api/profile";
import CameraBackground from "@/components/Camera/CameraBackground/CameraBackground";
import CameraFooter from "@/components/Camera/CameraFooter/CameraFooter";
import CameraHeader from "@/components/Camera/CameraHeader/CameraHeader";
import FocusIcon from "@/components/Camera/FocusIcon/FocusIcon";
import NoCameraDevice from "@/components/Camera/NoCameraDevice/NoCameraDevice";
import RequestCameraPermission from "@/components/Camera/RequestCameraPermission/RequestCameraPermission";
import CropProfileImageModal from "@/components/CropProfileImageModal/CropProfileImageModal";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { getImageUri } from "@/utils/utils";

// Max images for a post
const MAX_IMAGES = 1;

const ProfileImageCamera = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { authProfile, updateProfileImage } = useAuthProfileContext();

  const [image, setImage] = useState<PhotoFile | ImagePickerAsset | ImageCropPicker.Image | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [saveImageLoading, setSaveImageLoading] = useState(false);

  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null!);
  const device = useCameraDevice(facing);

  const takePicture = async () => {
    if (cameraRef?.current) {
      const newImage = await cameraRef.current.takePhoto({
        flash: flash,
      });
      if (newImage) {
        setImage(newImage);
        setCropModalVisible(true);
      }
    }
  };

  // handle choosing image from camera roll
  const handlePickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
      allowsMultipleSelection: false,
      selectionLimit: 1, // limit the number of images that can be selected
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setCropModalVisible(true);
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

  const handleSavePress = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("profileId", authProfile.id.toString());

    formData.append("image", {
      uri: getImageUri(image),
      name: `profile_image.jpeg`,
      type: "image/jpeg",
      mimeType: "multipart/form-data",
    } as any);

    const accessToken = await SecureStore.getItemAsync("ACCESS_TOKEN");
    if (accessToken) {
      setSaveImageLoading(true);
      if (authProfile.image) {
        // edit profile image
        const { error, data } = await editProfileImage(authProfile.image.id, formData, accessToken);
        if (!error && data) {
          updateProfileImage(data);
          setImage(null);
          setCropModalVisible(false);
          router.back();
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "There was an error updating your profile picture.",
          });
        }
      } else {
        // create new profile image
        const { error, data } = await addProfileImage(formData, accessToken);
        if (!error && data) {
          updateProfileImage(data);
          setImage(null);
          setCropModalVisible(false);
          router.back();
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "There was an error updating your profile picture.",
          });
        }
      }
      setSaveImageLoading(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error updating your profile picture.",
      });
    }
  };

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

  const handleCloseCamera = () => {
    setImage(null);
    router.dismissAll();
  };

  if (device && hasPermission && isFocused) {
    const maxImagesReached = !!image;

    content = (
      <GestureHandlerRootView>
        <View style={{ flex: 1, position: "relative" }}>
          <CameraBackground />

          {/* Top */}
          <CameraHeader
            handleBackButtonPress={handleCloseCamera}
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
            images={[]} // pass empty array because we only have one image, so the next button is not shown
            pickImage={handlePickImage}
            takePicture={takePicture}
            onNextButtonPress={undefined} // don't have a next button for profile image (only one image)
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
      <CropProfileImageModal
        visible={cropModalVisible}
        setVisible={setCropModalVisible}
        image={image}
        setImage={setImage}
        onSave={handleSavePress}
        saveImageLoading={saveImageLoading}
      />
    </View>
  );
};

export default ProfileImageCamera;

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
