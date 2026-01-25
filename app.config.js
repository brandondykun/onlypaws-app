const APP_VARIANT = process.env.APP_VARIANT ? process.env.APP_VARIANT : "development";
const SCHEME = process.env.SCHEME ? process.env.SCHEME : "onlypawsappdev";

// Different app name, bundle identifier (ios) and package (android) are used
// so different variants of the app can be on the same device simultaneously

// Get correct app name based on app variant
const APP_NAME =
  APP_VARIANT === "production" ? "OnlyPaws" : APP_VARIANT === "preview" ? "OnlyPaws (Preview)" : "OnlyPaws (Dev)";

// Get correct bundle identifier based on app variant
const BUNDLE_IDENTIFIER =
  APP_VARIANT === "production"
    ? "com.bdykun.onlypawsapp"
    : APP_VARIANT === "preview"
      ? "com.bdykun.onlypawsapp.preview"
      : "com.bdykun.onlypawsapp.dev";

export default {
  expo: {
    name: APP_NAME,
    newArchEnabled: true,
    slug: "only-paws-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/ios-light.png",
    splash: {
      image: "./assets/icons/splash-icon-dark.png",
      resizeMode: "contain",
      backgroundColor: "#f4f4f5",
    },
    scheme: SCHEME,
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      infoPlist: {
        NSCameraUsageDescription: "OnlyPaws needs access to your Camera.",
        NSMicrophoneUsageDescription: "OnlyPaws needs access to your Microphone.",
      },
      icon: "./assets/icons/ios-light.png",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/adaptive-icon.png",
        monochromeImage: "./assets/icons/adaptive-icon.png",
        backgroundColor: "#f4f4f5",
      },
      permissions: ["android.permission.CAMERA", "android.permission.RECORD_AUDIO"],
      package: BUNDLE_IDENTIFIER,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-secure-store",
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-4419810431864546~3114070928",
          iosAppId: "ca-app-pub-4419810431864546~9181889474",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow OnlyPaws to access your camera roll.",
        },
      ],
      [
        "react-native-vision-camera",
        {
          cameraPermissionText: "OnlyPaws needs access to your Camera.",
          enableMicrophonePermission: true,
          microphonePermissionText: "OnlyPaws needs access to your Microphone.",
          enableCodeScanner: true,
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#f4f4f5",
          image: "./assets/icons/splash-icon-dark.png",
          dark: {
            image: "./assets/icons/splash-icon-light.png",
            backgroundColor: "#09090b",
          },
          imageWidth: 200,
          resizeMode: "contain",
        },
      ],
      "expo-font",
      [
        "expo-media-library",
        {
          photosPermission: "Allow OnlyPaws to access your photos.",
          savePhotosPermission: "Allow OnlyPaws to save photos.",
          isAccessMediaLocationEnabled: true,
          granularPermissions: ["audio", "photo"],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "2eb94b50-5f7d-4666-8ff6-f75a12007113",
      },
    },
  },
};
