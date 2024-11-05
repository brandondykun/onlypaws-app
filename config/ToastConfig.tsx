// App.jsx
import { ToastProps } from "react-native-toast-message";

import ErrorToast from "@/components/Toasts/ErrorToast/ErrorToast";
import SuccessToast from "@/components/Toasts/SuccessToast/SuccessToast";

type CustomToastProps = {
  type: string;
  text1?: string;
  text2?: string;
} & ToastProps;

export const toastConfig = {
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  // error: (props: ToastProps) => (
  //   <ErrorToast
  //     {...props}
  //     contentContainerStyle={{ backgroundColor: COLORS.red[200] }}
  //     text1Style={{
  //       fontSize: 17,
  //     }}
  //     text2Style={{
  //       fontSize: 15,
  //     }}
  //   />
  // ),

  error: ({ text1, text2 }: CustomToastProps) => <ErrorToast text1={text1} text2={text2} />,
  success: ({ text1, text2 }: CustomToastProps) => <SuccessToast text1={text1} text2={text2} />,
};
