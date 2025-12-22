import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, useWindowDimensions, View, StyleSheet } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  isLoading: boolean;
  error: string | null;
  onTryAgainPress: () => void;
};

const QrScannerFooter = ({ isLoading, error, onTryAgainPress }: Props) => {
  const { setLightOrDark } = useColorMode();
  const { width, height } = useWindowDimensions();

  let content = null;

  if (!isLoading && !error) return content;

  if (isLoading && !error) {
    content = (
      <View style={s.loadingContainer}>
        <ActivityIndicator color={setLightOrDark(COLORS.zinc[600], COLORS.zinc[400])} size="large" />
      </View>
    );
  }

  if (error) {
    content = (
      <View style={s.errorContainer}>
        <Text style={s.errorText}>{error}</Text>
        <Button
          buttonStyle={s.tryAgainButton}
          text="Try again"
          onPress={onTryAgainPress}
          variant="text"
          icon={
            <Ionicons name="refresh-outline" size={18} color={setLightOrDark(COLORS.zinc[600], COLORS.zinc[200])} />
          }
        />
      </View>
    );
  }

  return <View style={{ ...s.root, height: (height - width) / 2 }}>{content}</View>;
};

export default QrScannerFooter;

const s = StyleSheet.create({
  root: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingContainer: {
    paddingTop: 24,
  },
  errorContainer: {
    paddingTop: 12,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    color: COLORS.red[500],
  },
  tryAgainButton: {
    marginLeft: -16,
  },
});
