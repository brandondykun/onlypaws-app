import Octicons from "@expo/vector-icons/Octicons";
import {
  BottomSheetModalProps,
  BottomSheetModal as RNBottomSheetModal,
  SNAP_POINT_TYPE,
  BottomSheetTextInput as RNBottomSheetTextInput,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput";
import { forwardRef, ForwardedRef, useMemo, RefObject, useState } from "react";
import { Keyboard, Platform, Pressable, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  children: React.ReactNode;
  handleTitle: string;
  onChange?: ((index: number, position: number, type: SNAP_POINT_TYPE) => void) | undefined;
  onDismiss?: () => void;
} & BottomSheetModalProps;

export const DARK_BORDER_COLOR = "#313135";

const BottomSheetModal = forwardRef(
  (
    { children, handleTitle, onChange, onDismiss, ...props }: Props,
    ref: ForwardedRef<RNBottomSheetModal<any>> | undefined,
  ) => {
    const snapPoints = useMemo(() => ["90%"], []);
    const { isDarkMode } = useColorMode();

    return (
      <RNBottomSheetModal
        accessible={Platform.select({
          // make child elements accessible during testing
          // setting it to false on Android seems to cause issues with TalkBack instead
          ios: false,
        })}
        ref={ref}
        onChange={onChange}
        snapPoints={snapPoints}
        index={0}
        backgroundStyle={{ backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[100] }}
        enablePanDownToClose={true}
        onDismiss={onDismiss}
        enableHandlePanningGesture={true}
        enableContentPanningGesture={Platform.OS === "ios" ? true : false}
        enableDynamicSizing={false}
        handleIndicatorStyle={{ marginTop: 4, backgroundColor: isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900] }}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
        keyboardBlurBehavior="restore"
        handleComponent={() => {
          return (
            <View
              style={{
                alignItems: "center",
                borderBottomColor: isDarkMode ? DARK_BORDER_COLOR : COLORS.zinc[300],
                borderBottomWidth: 1,
                paddingBottom: 8,
              }}
              testID="bottom-sheet-handle"
            >
              <Octicons name="horizontal-rule" size={30} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900]} />
              <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", marginTop: -5 }}>
                {handleTitle}
              </Text>
            </View>
          );
        }}
        backdropComponent={(props) => {
          return (
            <BottomSheetBackdrop
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.6}
              onPress={() => Keyboard.dismiss()}
              {...props}
            />
          );
        }}
        {...props}
      >
        <Pressable onPress={() => Keyboard.dismiss()} style={{ flex: 1 }} android_disableSound>
          {children}
        </Pressable>
      </RNBottomSheetModal>
    );
  },
);

export const BottomSheetTextInput = forwardRef(
  (
    { ...props }: BottomSheetTextInputProps,
    ref: ((instance: TextInput | null) => void) | RefObject<TextInput> | null | undefined,
  ) => {
    const { isDarkMode, setLightOrDark } = useColorMode();
    const [isFocused, setIsFocused] = useState(false);

    return (
      <RNBottomSheetTextInput
        ref={ref}
        style={{
          borderRadius: 25,
          paddingHorizontal: 16,
          borderColor: isFocused ? setLightOrDark(COLORS.zinc[950], COLORS.zinc[400]) : COLORS.zinc[500],
          borderWidth: 1,
          fontSize: 18,
          paddingVertical: 10,
          color: isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900],
        }}
        placeholderTextColor={COLORS.zinc[500]}
        onFocus={() => setIsFocused(true)}
        {...props}
        onBlur={(e) => {
          props.onBlur && props.onBlur(e);
          setIsFocused(false);
        }}
      />
    );
  },
);

BottomSheetTextInput.displayName = "BottomSheetTextInput";
BottomSheetModal.displayName = "BottomSheetModal";
export default BottomSheetModal;
