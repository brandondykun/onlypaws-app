import { View, StyleSheet } from "react-native";
import { ToastProps } from "react-native-toast-message";

import ProfileImage from "@/components/ProfileImage/ProfileImage";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const DARK_BG_COLOR = COLORS.zinc[900];
const DARK_BORDER_COLOR = COLORS.zinc[900];

const LIGHT_BG_COLOR = COLORS.zinc[200];
const LIGHT_BORDER_COLOR = COLORS.zinc[200];

const NotificationToast = (props: ToastProps & { imageUri?: string; text1?: string }) => {
  const { setLightOrDark } = useColorMode();

  // ignore this line due to typing issue.
  // TODO: figure out how to properly type custom toast props
  // @ts-ignore
  const { props: toastProps } = props;

  const imageUri: string | undefined = toastProps.imageUri;

  return (
    <View
      style={[
        s.root,
        {
          backgroundColor: setLightOrDark(LIGHT_BG_COLOR, DARK_BG_COLOR),
          borderColor: setLightOrDark(LIGHT_BORDER_COLOR, DARK_BORDER_COLOR),
        },
      ]}
    >
      <ProfileImage image={imageUri || null} size={34} />
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>{props.text1}</Text>
      </View>
    </View>
  );
};

export default NotificationToast;

const s = StyleSheet.create({
  root: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
});
