import Ionicons from "@expo/vector-icons/Ionicons";
import { QueryObserverResult } from "@tanstack/react-query";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Button from "../Button/Button";
import Text from "../Text/Text";

type Props = {
  refresh: () => Promise<void> | Promise<QueryObserverResult<any, Error>>;
  errorText: string;
  style?: StyleProp<ViewStyle>;
};

const ErrorMessageWithRefresh = ({ refresh, errorText, style }: Props) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View style={[s.root, style]}>
      <Text style={s.errorText}>{errorText}</Text>
      <Button
        text="Retry"
        variant="text"
        onPress={refresh}
        icon={<Ionicons name="refresh-outline" size={18} color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />}
        textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
      />
    </View>
  );
};

export default ErrorMessageWithRefresh;

const s = StyleSheet.create({
  root: {
    paddingTop: 96,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
});
