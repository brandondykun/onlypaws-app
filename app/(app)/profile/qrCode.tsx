import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState, useRef } from "react";
import { View, StyleSheet, useWindowDimensions, ScrollView, Pressable } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

import Button from "@/components/Button/Button";
import DownloadQrCodeConfirmationModal from "@/components/DownloadQrCodeConfirmationModal/DownloadQrCodeConfirmationModal";
import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import QrCodeScannerModal from "@/components/QrCodeScannerModal/QrCodeScannerModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";
import toast from "@/utils/toast";

const QrCodeScreen = () => {
  const { selectedProfileId, authProfile } = useAuthProfileContext();
  const { setLightOrDark, isDarkMode } = useColorMode();
  const { width } = useWindowDimensions();

  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const viewShotRef = useRef<ViewShot>(null);
  const bottomSheetRef = useRef<RNBottomSheetModal>(null);
  const router = useRouter();

  const [qrCodeScannerModalVisible, setQrCodeScannerModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={showSaveQrCodeBottomSheet}
          style={({ pressed }) => [pressed && { opacity: 0.7 }, { paddingHorizontal: 16, paddingVertical: 8 }]}
        >
          <Feather name="download" size={22} color={setLightOrDark(COLORS.zinc[950], COLORS.zinc[300])} />
        </Pressable>
      ),
    });
  }, [navigation, setLightOrDark, router]);

  const showSaveQrCodeBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleDownloadQrCodePress = async () => {
    if (!viewShotRef) return;

    let { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== "granted") {
      toast.error("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    if (viewShotRef.current?.capture) {
      viewShotRef.current
        .capture()
        .then((uri: string) => {
          MediaLibrary.createAssetAsync(uri);
          toast.success("QR code downloaded to your camera roll!");
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error downloading QR code to your camera roll");
        });
    }
    bottomSheetRef.current?.close();
  };

  // create a deep link url for the profile details screen
  const deepLinkUrl = Linking.createURL(`profile/profileDetails`, {
    queryParams: {
      profileId: selectedProfileId.toString(),
    },
  });

  const handleQrCodeScannerModalClose = () => {
    setQrCodeScannerModalVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ ...s.scrollView, paddingBottom: tabBarHeight + 8 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ ...s.mainView }}>
        <ViewShot ref={viewShotRef}>
          <View style={{ ...s.contentContainer, backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]) }}>
            <View style={s.logoContainer}>
              <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} width={180} height={45} />
            </View>
            <View style={s.profileImageContainer}>
              <ProfileDetailsHeaderImage image={authProfile.image} size={60} />
            </View>
            <Text style={s.usernameText} darkColor={COLORS.sky[100]} lightColor={COLORS.zinc[900]}>
              @{authProfile.username}
            </Text>
            <View
              style={{
                backgroundColor: setLightOrDark(COLORS.sky[50], COLORS.sky[950]),
                borderColor: setLightOrDark(COLORS.sky[200], COLORS.sky[900]),
                ...s.qrCodeContainer,
              }}
            >
              <QRCode
                value={deepLinkUrl}
                size={width * 0.5}
                backgroundColor="transparent"
                color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[200])}
              />
            </View>
            <Text style={s.helpText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
              {`Scan this QR code from within the OnlyPaws app to view @${authProfile.username}'s profile!`}
            </Text>
          </View>
        </ViewShot>
        <View style={s.scanButtonContainer}>
          <Button
            text="Scan a code"
            onPress={() => setQrCodeScannerModalVisible(true)}
            buttonStyle={s.scanButton}
            icon={<Ionicons name="scan-outline" size={18} color={setLightOrDark(COLORS.zinc[50], COLORS.zinc[900])} />}
          />
        </View>
      </View>
      <QrCodeScannerModal visible={qrCodeScannerModalVisible} onClose={handleQrCodeScannerModalClose} />
      <DownloadQrCodeConfirmationModal
        ref={bottomSheetRef}
        onSavePress={handleDownloadQrCodePress}
        onCancelPress={() => bottomSheetRef.current?.close()}
      />
    </ScrollView>
  );
};

export default QrCodeScreen;

const s = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  mainView: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: 16,
  },
  logoContainer: {
    marginBottom: 16,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  qrCodeContainer: {
    borderWidth: 3,
    borderRadius: 16,
    padding: 14,
    marginBottom: 32,
  },
  scanButton: {
    borderRadius: 100,
    paddingHorizontal: 16,
  },
  helpText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  scanButtonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
