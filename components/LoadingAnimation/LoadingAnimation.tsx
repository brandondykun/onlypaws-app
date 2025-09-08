import LottieView from "lottie-react-native";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Modal from "../Modal/Modal";
import Text from "../Text/Text";

// Full screen, blocking animation. Can be used for any loading state that needs to block the full screen.

type Props = {
  visible: boolean;
  animationSource: string;
  title: string;
};

const LoadingAnimation = ({ visible, animationSource, title }: Props) => {
  const { isDarkMode } = useColorMode();

  return (
    <Modal visible={visible} animationType="fade" withScroll={false} transparent={true} raw={true}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.9)",
        }}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View>
          <LottieView style={{ height: 150, width: 150 }} source={animationSource} autoPlay loop />
        </View>
        <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[700]} style={{ fontSize: 26, fontWeight: "300" }}>
          {title}
        </Text>
      </View>
    </Modal>
  );
};

export default LoadingAnimation;
