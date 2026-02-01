import Toast, { ToastShowParams } from "react-native-toast-message";

/**
 * Default titles for each toast type
 */
const DEFAULT_TITLES = {
  error: "Error",
  success: "Success",
  info: "Info",
} as const;

type ToastType = keyof typeof DEFAULT_TITLES;

/**
 * Options for shorthand toast methods
 */
type ShorthandToastOptions = Omit<ToastShowParams, "type" | "text1" | "text2">;

/**
 * Options for notification toast
 */
type NotificationToastOptions = Omit<ToastShowParams, "type" | "text1"> & {
  imageUri?: string;
};

/**
 * Options for savePost toast
 */
type SavePostToastOptions = Omit<ToastShowParams, "type"> & {
  imageUri: string;
};

/**
 * Creates a shorthand toast function for a given type
 */
const createShorthandToast =
  (type: ToastType) =>
  (message: string, options?: ShorthandToastOptions): void => {
    Toast.show({
      type,
      text1: DEFAULT_TITLES[type],
      text2: message,
      ...options,
    });
  };

/**
 * Toast utility wrapper providing convenient shorthand methods
 *
 * @example
 * // Shorthand methods - just pass the message
 * toast.error("Something went wrong");
 * toast.success("Profile updated!");
 * toast.info("New features available");
 *
 * // With additional options
 * toast.error("Connection failed", { visibilityTime: 5000 });
 *
 * // Notification toast with image
 * toast.notification("John liked your post", { imageUri: "https://..." });
 *
 * // Save post toast
 * toast.savePost({ imageUri: "https://..." });
 *
 * // Full control - original Toast.show API
 * toast.show({ type: "error", text1: "Custom Title", text2: "Custom message" });
 *
 * // Other Toast methods
 * toast.hide();
 */
export const toast = {
  /**
   * Show an error toast
   * @param message - The message to display (text2)
   * @param options - Additional toast options
   */
  error: createShorthandToast("error"),

  /**
   * Show a success toast
   * @param message - The message to display (text2)
   * @param options - Additional toast options
   */
  success: createShorthandToast("success"),

  /**
   * Show an info toast
   * @param message - The message to display (text2)
   * @param options - Additional toast options
   */
  info: createShorthandToast("info"),

  /**
   * Show a notification toast with profile image
   * @param text1 - The notification text
   * @param options - Additional toast options including imageUri
   */
  notification: (text1: string, options?: NotificationToastOptions): void => {
    Toast.show({
      type: "notification",
      text1,
      props: {
        imageUri: options?.imageUri,
      },
      ...options,
    });
  },

  /**
   * Show a save post toast with image thumbnail (appears at bottom)
   * @param options - Toast options including required imageUri
   */
  savePost: (options: SavePostToastOptions): void => {
    const { imageUri, ...rest } = options;
    Toast.show({
      type: "savePost",
      position: "bottom",
      props: {
        imageUri,
      },
      ...rest,
    });
  },

  /**
   * Original Toast.show method for full control
   * Use this when you need custom text1 or other advanced options
   */
  show: Toast.show,

  /**
   * Hide the currently visible toast
   */
  hide: Toast.hide,
};

// Also export as default for flexibility
export default toast;
