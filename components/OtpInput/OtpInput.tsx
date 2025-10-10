import { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { OtpInput as RNTOtpInput, OtpInputRef } from "react-native-otp-entry";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

const OtpInput = forwardRef<OtpInputRef, { setOtpCode: (text: string) => void; error?: string }>(
  ({ setOtpCode, error }, ref) => {
    const { setLightOrDark } = useColorMode();
    return (
      <>
        <RNTOtpInput
          ref={ref}
          numberOfDigits={6}
          focusColor={setLightOrDark(COLORS.zinc[900], COLORS.zinc[300])}
          autoFocus={true}
          hideStick={true}
          placeholder="------"
          blurOnFilled={true}
          disabled={false}
          type="alphanumeric"
          secureTextEntry={false}
          focusStickBlinkingDuration={500}
          onTextChange={(text) => setOtpCode(text)}
          textInputProps={{ accessibilityLabel: "One-Time Password" }}
          textProps={{
            accessibilityRole: "text",
            accessibilityLabel: "OTP digit",
            allowFontScaling: false,
          }}
          theme={{
            containerStyle: s.otpContainer,
            pinCodeContainerStyle: {
              borderColor: setLightOrDark(COLORS.zinc[600], COLORS.zinc[500]),
              height: 42,
              width: 42,
              borderRadius: 6,
              backgroundColor: setLightOrDark(COLORS.zinc[125], COLORS.zinc[900]),
            },
            pinCodeTextStyle: { color: setLightOrDark(COLORS.zinc[950], COLORS.zinc[100]), fontSize: 22 },
            focusedPinCodeContainerStyle: s.focusedPinCodeContainerStyle,
          }}
        />
        <Text style={s.errorText}>{error}</Text>
      </>
    );
  },
);

OtpInput.displayName = "OtpInput";

export default OtpInput;

const s = StyleSheet.create({
  otpContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  focusStick: {
    display: "none",
  },
  focusedPinCodeContainerStyle: {
    borderColor: COLORS.sky[500],
    borderWidth: 2,
  },
  errorText: {
    color: COLORS.red[500],
    textAlign: "center",
    minHeight: 16,
  },
});
