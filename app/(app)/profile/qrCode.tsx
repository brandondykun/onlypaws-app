import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Linking from "expo-linking";
import { useState } from "react";
import { View, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";

import Button from "@/components/Button/Button";
import ProfileDetailsHeaderImage from "@/components/ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import QrCodeScannerModal from "@/components/QrCodeScannerModal/QrCodeScannerModal";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";

const QrCodeScreen = () => {
  const { selectedProfileId } = useAuthUserContext();
  const { authProfile } = useAuthProfileContext();
  const { setLightOrDark, isDarkMode } = useColorMode();
  const { width } = useWindowDimensions();

  const tabBarHeight = useBottomTabBarHeight();

  const [qrCodeScannerModalVisible, setQrCodeScannerModalVisible] = useState(false);

  // create a deep link url for the profile details screen
  const deepLinkUrl = Linking.createURL(`profile/profileDetails`, {
    queryParams: {
      profileId: selectedProfileId!.toString(),
    },
  });

  const handleQrCodeScannerModalClose = () => {
    setQrCodeScannerModalVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ ...s.scrollView, paddingBottom: tabBarHeight + 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ ...s.mainView }}>
        <View style={{ ...s.contentContainer }}>
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
