import { ModalProps, Modal as RNModal, ScrollView, View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  children: React.ReactNode;
  withScroll?: boolean;
  raw?: boolean;
  backgroundColor?: string;
} & ModalProps;

const Modal = ({ children, withScroll = true, raw = false, backgroundColor, ...rest }: Props) => {
  const { isDarkMode } = useColorMode();

  const bgColor = backgroundColor ? backgroundColor : isDarkMode ? COLORS.zinc[900] : COLORS.zinc[100];

  if (withScroll) {
    return (
      <RNModal {...rest}>
        <ScrollView style={{ flex: 1, backgroundColor: bgColor, paddingTop: 50 }}>{children}</ScrollView>
      </RNModal>
    );
  }

  if (raw) {
    return <RNModal {...rest}>{children}</RNModal>;
  }

  return (
    <RNModal {...rest}>
      <View style={{ backgroundColor: bgColor, flex: 1 }}>{children}</View>
    </RNModal>
  );
};

export default Modal;
