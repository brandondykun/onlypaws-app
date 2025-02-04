import DraggableFlatList from "@bwjohns4/react-native-draggable-flatlist";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import { useRef, useState, useCallback } from "react";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions, Pressable, Platform, ActivityIndicator } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, PhotoFile, useCameraDevice, useCameraPermission, Point } from "react-native-vision-camera";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { getImageUri } from "@/utils/utils";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

import CameraBackground from "./CameraBackground";
import FocusIcon from "./FocusIcon";
import ImagePreviewModal from "./ImagePreviewModal";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  images: (PhotoFile | ImagePickerAsset)[];
  setImages: React.Dispatch<React.SetStateAction<(PhotoFile | ImagePickerAsset)[]>>;
  maxImages?: number;
  onSavePress?: () => void;
  loading?: boolean;
};

const CameraModal = ({ visible, setVisible, images, setImages, maxImages, onSavePress, loading }: Props) => {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [initialPreviewIndex, setInitialPreviewIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<"on" | "off">("off");

  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null!);
  const device = useCameraDevice(facing);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { setLightOrDark } = useColorMode();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const takePicture = async () => {
    if (cameraRef?.current) {
      if (!maxImages || images.length < maxImages) {
        const newImage = await cameraRef.current.takePhoto({
          flash: flash,
        });
        if (newImage) {
          setImages((prev) => [newImage, ...prev]);
        }
      }
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [result.assets[0], ...prev]);
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
    <View>
      <Text>Loading...</Text>
    </View>
  );
  if (device == null) {
    content = (
      <View style={{ alignItems: "center" }}>
        <Text style={s.message}>Uh oh! No Camera Device Found.</Text>
        <View style={{ alignItems: "center", paddingBottom: 48 }}>
          <Button onPress={() => setVisible(false)} text="Back" variant="text" />
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    // Camera permissions are not granted yet.
    content = (
      <View
        style={[s.requestPermissionsContainer, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={s.message}>We can't wait to see your pets!</Text>
          <Text style={s.message}>But first, we need your permission to access the camera.</Text>
          <View style={{ alignItems: "center" }}>
            <Button
              onPress={requestPermission}
              text="Grant Permission"
              variant="text"
              textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
            />
          </View>
        </View>
        <View style={{ alignItems: "center", paddingBottom: 48 }}>
          <Button onPress={() => setVisible(false)} text="Cancel" variant="text" />
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "on" ? "off" : "on"));
  };

  if (device && hasPermission) {
    const maxImagesReached = images.length === maxImages;

    content = (
      <GestureHandlerRootView>
        <View style={{ flex: 1, position: "relative" }}>
          <CameraBackground />

          {/* Top */}
          <View
            style={[
              s.topContainer,
              {
                height: (screenHeight - screenWidth) / 2,
              },
            ]}
          >
            <View style={[s.topIconContainer, { marginTop: Platform.OS === "ios" ? insets.top : 12 }]}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons
                  name={Platform.OS === "ios" ? "chevron-back-outline" : "arrow-back-sharp"}
                  size={Platform.OS === "ios" ? 30 : 25}
                  color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])}
                />
              </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <TouchableOpacity onPress={toggleFlash} hitSlop={10}>
                  <Ionicons
                    name={flash === "on" ? "flash" : "flash-off"}
                    size={24}
                    color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleCameraFacing} hitSlop={10}>
                  <MaterialIcons
                    name="flip-camera-ios"
                    size={30}
                    color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1, paddingBottom: 4, justifyContent: "flex-end" }}>
              <Text
                style={{
                  color: COLORS.zinc[500],
                  paddingLeft: 8,
                  paddingBottom: 2,
                  fontStyle: "italic",
                  fontSize: 14,
                }}
              >
                {images.length > 1 ? "Tap to edit - or - press, hold, drag to reorder" : ""}
              </Text>
              {images.length ? (
                <DraggableFlatList
                  horizontal={true}
                  data={images}
                  contentContainerStyle={{ flexGrow: 1, alignItems: "flex-end" }}
                  showsHorizontalScrollIndicator={false}
                  onDragBegin={() => Haptics.impactAsync()}
                  renderItem={({ item, drag, isActive }) => {
                    return (
                      <Pressable
                        onLongPress={drag}
                        onPress={() => {
                          const index = images.findIndex((image) => getImageUri(image) === getImageUri(item));
                          setInitialPreviewIndex(index);
                          setPreviewModalVisible(true);
                        }}
                        style={[
                          { borderRadius: 4 },

                          isActive && {
                            shadowColor: COLORS.zinc[950],
                            shadowOffset: {
                              width: 0,
                              height: 12,
                            },
                            shadowOpacity: 0.58,
                            shadowRadius: 16.0,
                            elevation: 24,
                          },
                        ]}
                      >
                        <Image
                          source={{ uri: getImageUri(item) }}
                          style={{
                            borderRadius: 4,
                            marginHorizontal: 2,
                            height: 100,
                            width: 100,
                          }}
                        />
                      </Pressable>
                    );
                  }}
                  keyExtractor={(item) => getImageUri(item)}
                  onDragEnd={({ data }) => setImages(data)}
                />
              ) : (
                <View style={{ flexDirection: "row", gap: 2, paddingLeft: 4 }}>
                  <View
                    style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}
                  />
                  <View
                    style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}
                  />
                  <View
                    style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}
                  />
                  <View
                    style={[s.placeholder, { backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]) }]}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Camera Square */}

          {/* Bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              left: 0,
              height: (screenHeight - screenWidth) / 2,
              zIndex: 1,
            }}
          >
            {maxImages ? (
              <>
                <View style={{ paddingTop: 4, justifyContent: "center", flexDirection: "row" }}>
                  <Text
                    darkColor={maxImagesReached ? COLORS.red[600] : COLORS.zinc[300]}
                    lightColor={COLORS.zinc[700]}
                    style={{ textAlign: "center", minWidth: 100 }}
                  >
                    {images.length} of {maxImages}
                  </Text>
                </View>
                <View>
                  <Text darkColor={COLORS.zinc[400]} style={{ textAlign: "center", fontWeight: 200 }}>
                    {maxImagesReached ? "Remove images above to add more." : ""}
                  </Text>
                </View>
              </>
            ) : null}
            <View style={{ flex: 1, justifyContent: "center", flexDirection: "row", marginTop: -32 }}>
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable
                  style={({ pressed }) => [
                    !maxImagesReached && pressed ? { opacity: 0.5 } : maxImagesReached ? { opacity: 0.3 } : null,
                  ]}
                  onPress={pickImage}
                  disabled={maxImagesReached}
                >
                  <MaterialIcons
                    name="camera-roll"
                    size={36}
                    color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])}
                  />
                </Pressable>
              </View>
              <View style={{ justifyContent: "center", alignItems: "center", opacity: maxImagesReached ? 0.3 : 1 }}>
                <TouchableOpacity onPress={takePicture} disabled={maxImagesReached ? true : false}>
                  <View
                    style={[
                      s.takeImageButtonRing,
                      { backgroundColor: setLightOrDark(COLORS.zinc[500], COLORS.zinc[400]) },
                    ]}
                  >
                    <View
                      style={[
                        s.takeImageButton,
                        {
                          backgroundColor: setLightOrDark(COLORS.zinc[950], COLORS.zinc[50]),
                          borderColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[950]),
                        },
                      ]}
                    >
                      <Ionicons name="paw" size={36} color={COLORS.zinc[400]} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                {onSavePress && images.length ? (
                  <Pressable
                    style={({ pressed }) => [pressed && { opacity: 0.6 }, { alignItems: "center" }]}
                    onPress={onSavePress}
                  >
                    <Ionicons name="checkmark-circle" size={32} color={COLORS.lime[500]} />
                    <Text
                      darkColor={COLORS.zinc[300]}
                      lightColor={COLORS.zinc[800]}
                      style={{ textAlign: "center", fontSize: 18 }}
                    >
                      Save
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
          {focusPoint ? <FocusIcon focusPoint={focusPoint} /> : null}
          <GestureDetector gesture={gesture}>
            <Camera
              style={s.camera}
              ref={cameraRef}
              device={device}
              isActive
              photo={true}
              enableZoomGesture={true}
              resizeMode="contain"
            />
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <Modal withScroll={false} visible={visible} onRequestClose={() => setVisible(false)}>
      <View style={s.contentContainer}>{visible ? content : null}</View>
      {loading ? (
        <View style={s.loadingView}>
          <ActivityIndicator color={COLORS.zinc[500]} />
        </View>
      ) : null}
      <ImagePreviewModal
        images={images}
        setImages={setImages}
        visible={previewModalVisible}
        setVisible={setPreviewModalVisible}
        initialIndex={initialPreviewIndex}
      />
    </Modal>
  );
};

export default CameraModal;

const s = StyleSheet.create({
  topContainer: {
    flex: 1,
    zIndex: 3,
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  topIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  requestPermissionsContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 16,
    fontSize: 18,
    fontWeight: "300",
  },
  camera: {
    position: "relative",
    flex: 1,
  },
  takeImageButtonRing: {
    padding: 4,
    borderRadius: 50,
  },
  takeImageButton: {
    height: 90,
    width: 90,
    borderRadius: 100,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 1,
  },
  placeholder: {
    borderRadius: 4,
    height: 100,
    width: 100,
  },
  loadingView: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.zinc[900],
    opacity: 0.7,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
