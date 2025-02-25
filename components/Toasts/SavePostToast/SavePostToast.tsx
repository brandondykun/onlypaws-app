import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ToastProps } from "react-native-toast-message";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const DARK_BG_COLOR = COLORS.zinc[800];
const DARK_BORDER_COLOR = COLORS.zinc[700];

const LIGHT_BG_COLOR = COLORS.zinc[200];
const LIGHT_BORDER_COLOR = COLORS.zinc[300];

const SavePostToast = (props: ToastProps & { imageUri?: string }) => {
  const { isDarkMode } = useColorMode();
  const safeAreaInsets = useSafeAreaInsets();

  // ignore this line due to typing issue.
  // TODO: figure out how to properly type custom toast props
  // @ts-ignore
  const { props: toastProps } = props;

  const imageUri = toastProps.imageUri;

  return (
    <View
      style={{
        width: "97%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 13,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: isDarkMode ? DARK_BG_COLOR : LIGHT_BG_COLOR,
        borderColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR,
        marginBottom: safeAreaInsets.bottom + 12,
      }}
    >
      <Image source={{ uri: imageUri }} style={{ width: 36, height: 36, borderRadius: 5 }} />

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>Post Saved!</Text>
      </View>
      <View style={{ paddingRight: 6 }}>
        <FontAwesome name={"bookmark"} size={20} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]} />
      </View>
    </View>
  );
};

export default SavePostToast;
