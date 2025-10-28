/**
 * AdPost component that mimics the Post component styling
 * Displays native ads in a format similar to regular posts
 */

import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState, useRef } from "react";
import { View, Dimensions, StyleSheet, Image, Animated } from "react-native";
import { NativeAd, NativeAdView, NativeAsset, NativeAssetType, NativeMediaView } from "react-native-google-mobile-ads";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { adManager } from "@/services/ads/AdManager";

import Text from "../Text/Text";

export const AD_POST_HEIGHT = Dimensions.get("window").width + 200;

type Props = {
  adId: string; // Unique ID for this ad position
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
};

const AdPost = ({ adId, onAdLoaded, onAdFailedToLoad }: Props) => {
  const { isDarkMode } = useColorMode();
  const screenWidth = Dimensions.get("window").width;
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const nativeAdRef = useRef<NativeAd | null>(null);

  useEffect(() => {
    // Start pulsing animation for skeleton
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    const loadAd = async () => {
      try {
        // Try to get preloaded ad from cache first
        const ad = await adManager.getAd(adId);

        if (ad) {
          nativeAdRef.current = ad;
          setNativeAd(ad);
          setIsLoading(false);
          pulseAnimation.stop();
          console.log(`Ad loaded for ${adId}`);
          onAdLoaded?.();
        } else {
          setIsLoading(false);
          pulseAnimation.stop();
          onAdFailedToLoad?.({
            name: "AdLoadError",
            message: "Failed to load ad",
          } as Error);
        }
      } catch (error) {
        console.log("Native ad failed to load:", error);
        setIsLoading(false);
        pulseAnimation.stop();
        onAdFailedToLoad?.(error as Error);
      }
    };

    loadAd();

    // Cleanup function to destroy the ad when component unmounts
    return () => {
      pulseAnimation.stop();
      if (nativeAdRef.current) {
        nativeAdRef.current.destroy();
      }
    };
  }, [adId, onAdLoaded, onAdFailedToLoad, pulseAnim]);

  // Show loading placeholder to reserve space and prevent layout shift
  if (isLoading || !nativeAd) {
    return (
      <Animated.View style={[s.container, { minHeight: AD_POST_HEIGHT, opacity: pulseAnim }]}>
        {/* Header Skeleton */}
        <View style={s.header}>
          <View style={s.headerContent}>
            <View style={s.profileSection}>
              <View
                style={[
                  s.adIcon,
                  {
                    backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                  },
                ]}
              />
              <View style={{ gap: 4 }}>
                <View
                  style={[
                    s.skeletonText,
                    { width: 100, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200] },
                  ]}
                />
                <View
                  style={[
                    s.skeletonText,
                    { width: 30, height: 16, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200] },
                  ]}
                />
              </View>
            </View>
            <View
              style={[
                s.adIndicator,
                {
                  backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                },
              ]}
            />
          </View>
        </View>

        {/* Image Skeleton */}
        <View
          style={{
            width: screenWidth,
            height: screenWidth,
            backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[100],
          }}
        />

        {/* Footer Skeleton */}
        <View style={s.footer}>
          <View style={s.content}>
            <View
              style={[
                s.skeletonText,
                { width: "80%", height: 20, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200] },
              ]}
            />
            <View
              style={[
                s.skeletonText,
                { width: "60%", backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200] },
              ]}
            />
          </View>
          <View
            style={[
              s.skeletonButton,
              {
                backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={[s.container, { minHeight: AD_POST_HEIGHT }]}>
      <NativeAdView nativeAd={nativeAd} style={[s.nativeAdView, { width: screenWidth }]}>
        {/* Header with Ad Badge */}
        <View style={s.header}>
          <View style={s.headerContent}>
            <View style={s.profileSection}>
              {/* Ad Icon */}
              {nativeAd.icon ? (
                <NativeAsset assetType={NativeAssetType.ICON}>
                  <Image
                    source={{ uri: nativeAd.icon.url }}
                    style={[
                      s.adIcon,
                      {
                        backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                      },
                    ]}
                    resizeMode="cover"
                  />
                </NativeAsset>
              ) : (
                <View
                  style={[
                    s.adIcon,
                    {
                      backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                    },
                  ]}
                >
                  <Ionicons name="megaphone" size={18} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]} />
                </View>
              )}

              <View>
                {/* Advertiser name */}
                <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                  <Text
                    style={[s.advertiser, { color: isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900] }]}
                    numberOfLines={1}
                  >
                    {nativeAd.advertiser || "Sponsored"}
                  </Text>
                </NativeAsset>

                {/* Ad Badge */}
                <View
                  style={[
                    s.adBadge,
                    {
                      backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                    },
                  ]}
                >
                  <Text style={[s.adBadgeText, { color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600] }]}>Ad</Text>
                </View>
              </View>
            </View>

            {/* Ad indicator icon */}
            <View
              style={[
                s.adIndicator,
                {
                  backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                  marginRight: 12,
                },
              ]}
            >
              <Ionicons name="megaphone-outline" size={14} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]} />
            </View>
          </View>
        </View>

        {/* Ad Media (Image/Video) */}
        <NativeAsset assetType={NativeAssetType.IMAGE}>
          <NativeMediaView
            style={{
              width: screenWidth,
              height: screenWidth,
              aspectRatio: 1,
              backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[100],
            }}
            resizeMode="contain"
          />
        </NativeAsset>

        {/* Call to Action Button */}
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <View
            style={[
              s.ctaButton,
              {
                // backgroundColor: isDarkMode ? COLORS.sky[975] : COLORS.sky[600],
                borderBottomWidth: 1,
                borderColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200],
              },
            ]}
          >
            <Text style={[s.ctaText, { color: isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900] }]}>
              {nativeAd.callToAction || "Learn More"}{" "}
            </Text>
            <Entypo name="chevron-small-right" size={28} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900]} />
          </View>
        </NativeAsset>

        {/* Ad Content Footer */}
        <View style={s.footer}>
          <View style={s.content}>
            {/* Headline */}
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={[s.headline, { color: isDarkMode ? COLORS.zinc[200] : COLORS.zinc[900] }]} numberOfLines={2}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>

            {/* Body/Tagline */}
            {nativeAd.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text
                  style={[s.tagline, { color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[700] }]}
                  numberOfLines={2}
                >
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            ) : null}
          </View>
        </View>
      </NativeAdView>
    </View>
  );
};

export default AdPost;

const s = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  nativeAdView: {
    width: "100%",
  },
  header: {
    padding: 8,
    paddingTop: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  advertiser: {
    fontSize: 16,
    fontWeight: "600",
  },
  adBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  adIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  footer: {
    padding: 12,
    gap: 12,
  },
  content: {
    gap: 4,
  },
  headline: {
    fontSize: 17,
    fontWeight: "700",
  },
  tagline: {
    fontSize: 14,
    fontWeight: "400",
  },
  ctaButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  skeletonText: {
    height: 18,
    borderRadius: 4,
  },
  skeletonButton: {
    height: 48,
    borderRadius: 8,
    alignSelf: "center",
    minWidth: 140,
  },
});
