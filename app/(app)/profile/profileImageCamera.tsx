import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState, useCallback } from "react";
import { StyleSheet, useWindowDimensions, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { Camera, useCameraDevice, useCameraPermission, Point, useCameraFormat } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";

import { getProfileImageUploadUrl, uploadFileToPresignedUrl, confirmProfileImageUpload } from "@/api/profile";
import CameraBackground from "@/components/Camera/CameraBackground/CameraBackground";
import CameraFooter from "@/components/Camera/CameraFooter/CameraFooter";
import CameraHeader from "@/components/Camera/CameraHeader/CameraHeader";
import FocusIcon from "@/components/Camera/FocusIcon/FocusIcon";
import NoCameraDevice from "@/components/Camera/NoCameraDevice/NoCameraDevice";
import RequestCameraPermission from "@/components/Camera/RequestCameraPermission/RequestCameraPermission";
import CropProfileImageModal from "@/components/CropProfileImageModal/CropProfileImageModal";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { ImageAsset } from "@/types/post/post";
import toast from "@/utils/toast";
import { getImageUri, getImageMimeType } from "@/utils/utils";

// Max images for a post
const MAX_IMAGES = 1;

const ProfileImageCamera = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { authProfile, updateProfileImage } = useAuthProfileContext();

  const [image, setImage] = useState<ImageAsset | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [saveImageLoading, setSaveImageLoading] = useState(false);
  const [imageChangeLoading, setImageChangeLoading] = useState(false);

  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null!);
  const device = useCameraDevice(facing);

  // Select the desired format
  const format = useCameraFormat(device, [
    // Swap width and height because cameras are in landscape orientation
    { videoAspectRatio: screenHeight / screenWidth }, // Target the screen's aspect ratio
  ]);

  const takePicture = async () => {
    if (cameraRef?.current) {
      setImageChangeLoading(true);
      const newImage = await cameraRef.current.takePhoto({
        flash: flash,
      });
      if (newImage) {
        setImage(newImage);
        setCropModalVisible(true);
      }
      setImageChangeLoading(false);
    }
  };

  // handle choosing image from camera roll
  const handlePickImage = async () => {
    // No permissions request is necessary for launching the image library
    setImageChangeLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
      allowsMultipleSelection: false,
      selectionLimit: 1, // limit the number of images that can be selected
    });

    if (result.canceled) {
      setImageChangeLoading(false);
      return;
    }

    if (!result.canceled) {
      setImage(result.assets[0]);
      setCropModalVisible(true);
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

  const handleSavePress = async () => {
    if (!image) return;

    setSaveImageLoading(true);

    try {
      // Step 1: Get presigned upload URL (same for create and update)
      const { data: uploadUrlData, error: urlError } = await getProfileImageUploadUrl(authProfile.id);
      if (urlError || !uploadUrlData) {
        toast.error("We couldn't prepare your photo. Please try again.");
        setSaveImageLoading(false);
        return;
      }

      const { upload_url, key } = uploadUrlData;
      const fileUri = getImageUri(image);
      if (!fileUri) {
        toast.error("We couldn't use this photo. Please try choosing or taking another one.");
        setSaveImageLoading(false);
        return;
      }
      const contentType = getImageMimeType(image);

      // Step 2: Upload file to storage (raw PUT, no auth)
      const { ok: uploadOk, error: uploadError } = await uploadFileToPresignedUrl(upload_url, fileUri, contentType);
      if (!uploadOk || uploadError) {
        toast.error("Your photo couldn't be uploaded. Please check your connection and try again.");
        setSaveImageLoading(false);
        return;
      }

      // Step 3: Confirm upload (backend links file to profile; returns 201 new / 200 update)
      const { data: confirmData, error: confirmError } = await confirmProfileImageUpload(authProfile.id, key);
      if (confirmError || !confirmData) {
        toast.error("We couldn't save your new profile picture. Please try again.");
        setSaveImageLoading(false);
        return;
      }

      // Optimistic update with local image so we don't rely on the confirm response URL (it may be deleted after processing)
      const localUri = getImageUri(image);
      const optimisticProfileImage = {
        ...confirmData,
        image: localUri ?? confirmData.image,
      };
      updateProfileImage(optimisticProfileImage);

      if (confirmData.processing_status === "FAILED") {
        toast.error("Something went wrong while preparing your photo. Please try again.");
        setSaveImageLoading(false);
        return;
      }

      // Navigate back immediately; server processing continues in background (like post uploads)
      setSaveImageLoading(false);
      toast.success("Profile picture updated!");
      router.back();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaveImageLoading(false);
    }
  };

  // get the aspect ratio of the camera preview container
  const previewAspectRatio = format?.photoWidth ? format.photoWidth / format.photoHeight : 1;
  // get the total vertical space not taken by the camera preview container
  const totalVerticalPadding = screenHeight - screenWidth * previewAspectRatio;
  // divide the total vertical padding by 2 to get the top and bottom padding
  const paddingGap = totalVerticalPadding / 2;
  // the padding gap is the same for the top and bottom because the preview image container is centered vertically

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
          <CameraBackground aspectRatio="1:1" />

          {/* Top */}
          <CameraHeader
            handleBackButtonPress={handleCloseCamera}
            toggleFlash={toggleFlash}
            flash={flash}
            toggleCameraFacing={toggleCameraFacing}
            aspectRatio="1:1"
            showAspectRatioToggle={false}
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
            imageChangeLoading={imageChangeLoading}
          />
          {focusPoint ? <FocusIcon focusPoint={focusPoint} /> : null}
          <View style={[s.cameraLayout, { top: paddingGap, bottom: paddingGap }]}>
            <GestureDetector gesture={gesture}>
              <Camera
                style={s.camera}
                ref={cameraRef}
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
  cameraLayout: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 20,
    overflow: "hidden",
  },
});
