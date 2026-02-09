import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as ImageCropPicker from "react-native-image-crop-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { ImageAsset } from "@/types/post/post";
import { getImageUri } from "@/utils/utils";

import Button from "../Button/Button";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  image: ImageAsset | null;
  setImage: React.Dispatch<React.SetStateAction<ImageAsset | null>>;
  onSave: () => Promise<void>;
  saveImageLoading: boolean;
};

const CropProfileImageModal = ({ visible, setVisible, image, setImage, onSave, saveImageLoading }: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();

  // maintain a stack of images that have been cropped to allow for undo
  const [cropHistoryStack, setCropHistoryStack] = useState<ImageAsset[]>([]);

  // handle image press that initiates the crop process
  const handleImagePress = (uri: string | null) => {
    if (!uri) return;
    ImageCropPicker.openCropper({
      path: uri,
      width: 1080,
      height: 1080,
      mediaType: "photo",
      compressImageQuality: 1,
    })
      .then((croppedImage) => {
        setCropHistoryStack((prev) => [...prev, image as ImageAsset]);
        setImage(croppedImage);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCancelPress = () => {
    setImage(null);
    setVisible(false);
    setCropHistoryStack([]);
  };

  const handleUndoCropPress = () => {
    setImage(cropHistoryStack[cropHistoryStack.length - 1]);
    setCropHistoryStack(cropHistoryStack.slice(0, -1));
  };

  return (
    <Modal visible={visible} onRequestClose={() => setVisible(false)} animationType="slide" withScroll={false}>
      <View style={[{ paddingTop: insets.top + 12 }, s.main]}>
        <Pressable
          onPress={handleCancelPress}
          style={({ pressed }) => [pressed && s.pressed, { top: insets.top + 24 }, s.closeButton]}
        >
          <AntDesign name="close" size={28} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />
        </Pressable>
        <View style={s.mainContent}>
          <Text style={s.headerTitle}>Crop Image</Text>
          {image && (
            <View style={s.previewContainer}>
              <Text style={{ color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[400]) }}>Small Preview</Text>
              <Image source={getImageUri(image)} style={s.smallImage} />
              <Text style={{ color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[400]) }}>Large Preview</Text>
              <Pressable
                onPress={() => handleImagePress(getImageUri(image))}
                style={({ pressed }) => [pressed && s.pressed]}
              >
                <Image source={getImageUri(image)} style={s.largeImage} />
              </Pressable>
              <Text style={s.cropHelpText} darkColor={COLORS.zinc[300]}>
                Tap image to crop
              </Text>
            </View>
          )}
        </View>
        <View style={s.undoCropButtonContainer}>
          {cropHistoryStack.length > 0 && (
            <Button
              text="Undo Crop"
              variant="text"
              onPress={handleUndoCropPress}
              iconPosition="left"
              icon={<MaterialIcons name="undo" size={20} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])} />}
            />
          )}
        </View>
        <View style={[{ paddingBottom: insets.bottom + 24 }, s.bottomButtonsContainer]}>
          <View style={s.buttonContainer}>
            <Button text="Cancel" buttonStyle={s.cancelButton} onPress={handleCancelPress} />
          </View>
          <View style={s.buttonContainer}>
            <Button text="Save" onPress={onSave} />
          </View>
        </View>
      </View>
      <LoadingAnimation
        visible={saveImageLoading}
        animationSource={require("../../assets/animations/upload.json")}
        title="Saving Profile Image"
      />
      <Toast config={toastConfig} />
    </Modal>
  );
};

export default CropProfileImageModal;

const s = StyleSheet.create({
  main: {
    flexGrow: 1,
    paddingHorizontal: 24,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  headerTitle: {
    paddingBottom: 48,
    fontSize: 18,
    fontWeight: "600",
  },
  previewContainer: {
    gap: 8,
    alignItems: "center",
  },
  mainContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
  },
  smallImage: {
    width: 50,
    height: 50,
    borderRadius: 200,
    marginBottom: 48,
  },
  largeImage: {
    width: 180,
    height: 180,
    borderRadius: 200,
  },
  undoCropButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  bottomButtonsContainer: {
    padding: 12,
    flexDirection: "row",
    gap: 16,
  },
  buttonContainer: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: COLORS.red[600],
  },
  pressed: {
    opacity: 0.5,
  },
  cropHelpText: {
    marginTop: 12,
    fontSize: 16,
  },
});
