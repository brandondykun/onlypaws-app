import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import { useRef, useState, useMemo, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions, Pressable, Platform } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  GestureUpdateEvent,
  PinchGestureHandlerEventPayload,
  GestureStateChangeEvent,
} from "react-native-gesture-handler";

import { COLORS } from "@/constants/Colors";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

import CameraBackground from "./CameraBackground";
import DeleteImageModal from "./DeleteImageModal";
import ImagePreviewModal from "./ImagePreviewModal";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  images: (CameraCapturedPicture | ImagePickerAsset)[];
  setImages: React.Dispatch<React.SetStateAction<(CameraCapturedPicture | ImagePickerAsset)[]>>;
  maxImages?: number;
  onSavePress?: () => void;
};

const CameraModal = ({ visible, setVisible, images, setImages, maxImages, onSavePress }: Props) => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [initialPreviewIndex, setInitialPreviewIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [lastZoom, setLastZoom] = useState(0.7);

  const cameraRef = useRef<CameraView>(null!);

  const screenWidth = Dimensions.get("window").width;

  const takePicture = async () => {
    if (cameraRef?.current) {
      if (!maxImages || images.length < maxImages) {
        const new_image = await cameraRef.current.takePictureAsync();
        if (new_image) {
          setImages((prev) => [new_image, ...prev]);
        }
      }
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [result.assets[0], ...prev]);
    }
  };

  const onPinch = useCallback(
    (event: GestureUpdateEvent<PinchGestureHandlerEventPayload>) => {
      let velocity = event.velocity / 50;
      if (event.velocity < 0) velocity = event.velocity / 20;
      const outFactor = lastZoom * (Platform.OS === "ios" ? 40 : 15);

      let newZoom =
        velocity > 0
          ? zoom + event.scale * velocity * (Platform.OS === "ios" ? 0.01 : 25)
          : zoom - event.scale * (outFactor || 1) * Math.abs(velocity) * (Platform.OS === "ios" ? 0.02 : 50);

      if (newZoom < 0) newZoom = 0;
      else if (newZoom > 0.7) newZoom = 0.7;

      setZoom(newZoom);
    },
    [zoom, setZoom, lastZoom],
  );

  const onPinchEnd = useCallback(
    (event: GestureStateChangeEvent<PinchGestureHandlerEventPayload>) => {
      setLastZoom(zoom);
    },
    [zoom, setLastZoom],
  );

  const pinchGesture = useMemo(() => Gesture.Pinch().onUpdate(onPinch).onEnd(onPinchEnd), [onPinch, onPinchEnd]);

  let content = (
    <View>
      <Text>Loading...</Text>
    </View>
  );

  if (!permission) {
    // Camera permissions are still loading.
    return content;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    content = (
      <View style={styles.requestPermissionsContainer}>
        <Text style={styles.message}>Uh oh! We need your permission to access the camera.</Text>
        <Button onPress={requestPermission} text="Grant Permission" variant="secondary" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (permission.granted) {
    content = (
      <GestureHandlerRootView>
        <GestureDetector gesture={pinchGesture}>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
            ratio="1:1"
            pictureSize="1920x1080"
            zoom={zoom}
          >
            <CameraBackground />
            <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, justifyContent: "center" }}>
              {/* Top */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 70,
                    paddingHorizontal: 16,
                  }}
                >
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <Ionicons name="chevron-back-outline" size={30} color={COLORS.zinc[100]} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleCameraFacing}>
                    <MaterialIcons name="flip-camera-ios" size={30} color={COLORS.zinc[100]} />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1, paddingBottom: 4, justifyContent: "flex-end" }}>
                  <Text
                    style={{
                      color: COLORS.zinc[500],
                      paddingLeft: 4,
                      paddingBottom: 2,
                      fontStyle: "italic",
                      fontSize: 14,
                    }}
                  >
                    {images.length > 1 ? "Press and hold then drag to reorder images" : ""}
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
                              const index = images.findIndex((image) => image.uri === item.uri);
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
                              source={{ uri: item.uri }}
                              style={[
                                item.uri === selectedImageUri
                                  ? { borderWidth: 1, borderColor: COLORS.red[600] }
                                  : undefined,
                                {
                                  borderRadius: 4,
                                  marginHorizontal: 2,
                                  height: 100,
                                  width: 100,
                                },
                              ]}
                            />
                          </Pressable>
                        );
                      }}
                      keyExtractor={(item) => item.uri}
                      onDragEnd={({ data }) => setImages(data)}
                    />
                  ) : (
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      <View style={{ borderRadius: 4, height: 100, width: 100, backgroundColor: COLORS.zinc[900] }} />
                      <View style={{ borderRadius: 4, height: 100, width: 100, backgroundColor: COLORS.zinc[900] }} />
                      <View style={{ borderRadius: 4, height: 100, width: 100, backgroundColor: COLORS.zinc[900] }} />
                      <View style={{ borderRadius: 4, height: 100, width: 100, backgroundColor: COLORS.zinc[900] }} />
                    </View>
                  )}
                  {/* {images.length
                  ? images.map((image) => {
                      return (
                        <TouchableOpacity
                          onLongPress={() => {
                            Haptics.impactAsync();
                            setSelectedImageUri(image.uri);
                          }}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setPreviewModalVisible(true);
                          }}
                          key={image.uri}
                        >
                          <Image
                            source={{ uri: image.uri }}
                            height={100}
                            width={100}
                            style={[
                              image.uri === selectedImageUri
                                ? { borderWidth: 1, borderColor: COLORS.red[600] }
                                : undefined,
                              { borderRadius: 4 },
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    })
                  : Array(5)
                      .fill(0)
                      .map((item, i) => {
                        return (
                          <View
                            style={{
                              height: 100,
                              width: 100,
                              backgroundColor: COLORS.zinc[800],
                              borderRadius: 4,
                              opacity: 0.9,
                            }}
                            key={i}
                          ></View>
                        );
                      })} */}
                  {/* </ScrollView> */}
                </View>
              </View>

              {/* Camera Square */}
              <View style={{ height: screenWidth, width: screenWidth }} />

              {/* Bottom */}
              <View style={{ flex: 1, justifyContent: "center", flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={pickImage}>
                    <MaterialIcons name="camera-roll" size={36} color={COLORS.zinc[300]} />
                  </Pressable>
                </View>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={takePicture}
                    disabled={maxImages && maxImages === images.length ? true : false}
                  >
                    <View style={styles.takeImageButtonRing}>
                      <View style={styles.takeImageButton}>
                        <Ionicons name="paw" size={24} color={COLORS.zinc[400]} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  {onSavePress && images.length ? (
                    <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={onSavePress}>
                      <Ionicons name="checkmark-circle" size={48} color={COLORS.lime[600]} />
                      <Text style={{ color: COLORS.zinc[300], textAlign: "center" }}>Save</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          </CameraView>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  return (
    <Modal withScroll={false} visible={visible} onRequestClose={() => setVisible(false)}>
      <View style={styles.contentContainer}>{visible ? content : null}</View>
      <ImagePreviewModal
        images={images}
        setImages={setImages}
        visible={previewModalVisible}
        setVisible={setPreviewModalVisible}
        initialIndex={initialPreviewIndex}
      />
      <DeleteImageModal
        visible={!!selectedImageUri}
        selectedImageUri={selectedImageUri}
        setSelectedImageUri={setSelectedImageUri}
        images={images}
        setImages={setImages}
      />
    </Modal>
  );
};

export default CameraModal;

const styles = StyleSheet.create({
  requestPermissionsContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.zinc[900],
    paddingHorizontal: 26,
    gap: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: COLORS.zinc[300],
    fontSize: 18,
  },
  camera: {
    position: "relative",
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingBottom: 48,
    paddingTop: 64,
    paddingHorizontal: 18,
  },
  takeImageButtonRing: {
    backgroundColor: COLORS.zinc[500],
    padding: 6,
    borderRadius: 50,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.zinc[100],
  },
  takeImageButton: {
    height: 80,
    width: 80,
    borderRadius: 100,
    backgroundColor: COLORS.zinc[200],
    borderWidth: 3,
    borderColor: COLORS.zinc[950],
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 1,
  },
});
