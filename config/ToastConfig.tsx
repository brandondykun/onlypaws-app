import { ToastProps, BaseToastProps } from "react-native-toast-message";

import ErrorToast from "@/components/Toasts/ErrorToast/ErrorToast";
import InfoToast from "@/components/Toasts/InfoToast/InfoToast";
import NotificationToast from "@/components/Toasts/NotificationToast/NotificationToast";
import SavePostToast from "@/components/Toasts/SavePostToast/SavePostToast";
import SuccessToast from "@/components/Toasts/SuccessToast/SuccessToast";

type CustomToastProps = {
  type: string;
  text1?: string;
  text2?: string;
} & ToastProps;

type SavePostToastProps = {
  imageUri?: string;
} & BaseToastProps;

type NotificationToastProps = {
  imageUri?: string;
  text1?: string;
} & BaseToastProps;

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
  savePost: ({ imageUri, ...props }: SavePostToastProps) => <SavePostToast imageUri={imageUri} {...props} />,
  notification: ({ imageUri, text1, ...props }: NotificationToastProps) => (
    <NotificationToast imageUri={imageUri} text1={text1} {...props} />
  ),
  info: ({ text1, text2 }: CustomToastProps) => <InfoToast text1={text1} text2={text2} />,
};
