import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { StyleSheet, useWindowDimensions, View, ActivityIndicator, AppState } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
  useCodeScanner,
} from "react-native-vision-camera";

import NoCameraDevice from "@/components/Camera/NoCameraDevice/NoCameraDevice";
import RequestCameraPermission from "@/components/Camera/RequestCameraPermission/RequestCameraPermission";
import { COLORS } from "@/constants/Colors";

import Modal from "../Modal/Modal";

import { Overlay } from "./components/Overlay";
import QrScannerFooter from "./components/QrScannerFooter";
import QrScannerHeader from "./components/QrScannerHeader";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const QrCodeScannerModal = ({ visible, onClose }: Props) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const cameraRef = useRef<Camera>(null!);
  const device = useCameraDevice(facing);

  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  // Get the app's scheme dynamically
  const appScheme = Linking.parse(Linking.createURL("")).scheme;

  // Reset qrLock and error when modal becomes visible
  useEffect(() => {
    if (visible) {
      qrLock.current = false;
      setScanError(null);
    }
  }, [visible]);

  // Also reset qrLock when app comes back from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && !qrLock.current) {
        setLoading(true);
        setScanError(null);
        qrLock.current = true;
        setTimeout(() => {
          const scannedUrl = codes[0].value as string;
          // Parse the deep link URL to extract path and query params
          const parsed = Linking.parse(scannedUrl);

          // Validate that the QR code belongs to this app
          if (parsed.scheme !== appScheme) {
            setScanError("That QR code doesn't belong to OnlyPaws!");
            setLoading(false);
            return;
          }

          // validate that the hostname, path, and profile id are correct
          const isCorrectHostname = parsed.hostname === "profile";
          const isCorrectPath = parsed.path === "profileDetails";
          const hasProfileId = parsed.queryParams?.profileId;

          // if the hostname, path, and profile id are correct, navigate to the profile details screen
          if (isCorrectHostname && isCorrectPath && hasProfileId) {
            router.push({
              pathname: "/(app)/profile/profileDetails",
              params: { profileId: parsed?.queryParams?.profileId as string },
            });
            onClose();
          } else {
            // Valid app scheme but unrecognized path
            setScanError("Unrecognized QR code format!");
          }
          setLoading(false);
        }, 500);
      }
    },
  });

  // handle pressing try again button to reset to scan state
  const handleTryScanAgain = () => {
    setScanError(null);
    qrLock.current = false;
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleCloseCamera = () => {
    onClose();
  };

  // Select the desired format
  const format = useCameraFormat(device, [
    // Swap width and height because cameras are in landscape orientation
    { videoAspectRatio: screenHeight / screenWidth }, // Target the screen's aspect ratio
  ]);

  // get the aspect ratio of the camera preview container
  const previewAspectRatio = format?.photoWidth ? format.photoWidth / format.photoHeight : 1;
  // get the total vertical space not taken by the camera preview container
  const totalVerticalPadding = screenHeight - screenWidth * previewAspectRatio;
  // divide the total vertical padding by 2 to get the top and bottom padding
  const paddingGap = totalVerticalPadding / 2;
  // the padding gap is the same for the top and bottom because the preview image container is centered vertically

  // default to loading state
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

  if (device && hasPermission) {
    // camera is ready and permissions are granted
    content = (
      <View style={s.scannerContainer}>
        <QrScannerHeader handleBackButtonPress={handleCloseCamera} toggleCameraFacing={toggleCameraFacing} />
        <View style={{ ...s.cameraLayout, top: paddingGap, bottom: paddingGap }}>
          <Camera
            style={s.camera}
            ref={cameraRef}
            device={device}
            isActive={visible}
            photo={true}
            enableZoomGesture={true}
            resizeMode="contain"
            codeScanner={codeScanner}
          />
        </View>
        <Overlay isScanning={loading} isError={!!scanError} />
        <QrScannerFooter isLoading={loading} error={scanError} onTryAgainPress={handleTryScanAgain} />
      </View>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} withScroll={false} animationType="slide">
      <View style={s.contentContainer}>{content}</View>
    </Modal>
  );
};

export default QrCodeScannerModal;

const s = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
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
