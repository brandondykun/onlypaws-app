import AntDesign from "@expo/vector-icons/AntDesign";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Pressable, View, Animated, StyleSheet } from "react-native";

import { completeOnboarding as completeOnboardingApi } from "@/api/auth";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

/**
 * OnboardingModal - Interactive tour component that guides new users through app features.
 * Displays a modal at the bottom of the screen that guides users through the main app tabs.
 */
type OnboardingStep = "welcome" | "feed" | "explore" | "addPost" | "posts" | "profile";

const STEP_ROUTES: Record<OnboardingStep, string> = {
  welcome: "",
  feed: "",
  explore: "/(app)/explore",
  addPost: "/(app)/add",
  posts: "/(app)/posts",
  profile: "/(app)/profile",
};

const ANIMATION_DURATIONS = {
  fadeOut: 200,
  fadeIn: 300,
  fadeInDelay: 100,
  backgroundFade: 500,
  navigationDelay: 200,
  welcomeTransitionDelay: 50,
  initialBackgroundFadeIn: 500, // Initial fade-in for background overlay
  initialModalFadeIn: 600, // Initial fade-in for modal content
  initialModalDelay: 600, // Delay before modal content starts fading in
};

type ModalContentProps = {
  content: {
    title: string;
    description: string;
    closingMessage?: string;
  };
  currentStep: OnboardingStep;
  onClosePress: () => void;
  onNextPress: () => void;
  isTransitioning?: boolean;
  fadeAnim: Animated.Value;
  closeIconColor: string;
};

const ModalContent = ({
  content,
  currentStep,
  onClosePress,
  onNextPress,
  isTransitioning,
  fadeAnim,
  closeIconColor,
}: ModalContentProps) => (
  <BlurView intensity={10} style={s.blurView} testID="onboarding-modal-blur-view">
    <Pressable
      onPress={onClosePress}
      style={({ pressed }) => [s.closeButton, pressed && s.closeButtonPressed]}
      testID="onboarding-modal-close-button"
    >
      <AntDesign name="close" size={20} color={closeIconColor} />
    </Pressable>
    <View style={s.contentContainer}>
      <View style={s.textContainer}>
        <Animated.View style={[s.textWrapper, { opacity: fadeAnim }]}>
          <Text style={s.titleText} darkColor={COLORS.sky[500]} lightColor={COLORS.sky[600]}>
            {content.title}
          </Text>
          <Text style={s.descriptionText} darkColor={COLORS.zinc[100]} lightColor={COLORS.zinc[800]}>
            {content.description}
          </Text>
          {content.closingMessage && (
            <Text style={s.closingMessageText} darkColor={COLORS.zinc[100]} lightColor={COLORS.zinc[800]}>
              {content.closingMessage}
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
    <View style={s.buttonContainer}>
      <Button
        text={currentStep === "profile" ? "Get Started" : "Next"}
        onPress={onNextPress}
        disabled={isTransitioning}
      />
    </View>
  </BlurView>
);

const OnboardingModal = () => {
  const { user, updateOnboardingCompleted } = useAuthUserContext();
  const { authProfile } = useAuthProfileContext();
  const { setLightOrDark } = useColorMode();

  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const backgroundFadeAnim = useRef(new Animated.Value(0)).current;

  // Generic fade animation helper using native driver (for opacity animations)
  const animateFade = (animValue: Animated.Value, toValue: number, duration: number, delay: number = 0) => {
    return new Promise<void>((resolve) => {
      Animated.timing(animValue, {
        toValue,
        duration,
        useNativeDriver: true,
        delay,
      }).start(() => {
        resolve();
      });
    });
  };

  // Non-native fade for opacity when used with height (which can't use native driver)
  const animateFadeNonNative = (animValue: Animated.Value, toValue: number, duration: number, delay: number = 0) => {
    return new Promise<void>((resolve) => {
      Animated.timing(animValue, {
        toValue,
        duration,
        useNativeDriver: false,
        delay,
      }).start(() => {
        resolve();
      });
    });
  };

  // Resets modal to initial state and triggers staggered fade-in animations
  const resetModalState = useCallback(() => {
    setVisible(true);
    setCurrentStep("welcome");
    // Start animations at 0 (invisible) for fade-in effect
    modalFadeAnim.setValue(0);
    backgroundFadeAnim.setValue(0);
    fadeAnim.setValue(1); // Set to 1 immediately - no fade needed since outer modal fades in

    // Animate background overlay first, then modal content after delay
    animateFade(backgroundFadeAnim, 1, ANIMATION_DURATIONS.initialBackgroundFadeIn);
    animateFadeNonNative(
      modalFadeAnim,
      1,
      ANIMATION_DURATIONS.initialModalFadeIn,
      ANIMATION_DURATIONS.initialModalDelay,
    );
  }, [backgroundFadeAnim, fadeAnim, modalFadeAnim]);

  // Show modal if user hasn't completed onboarding for their profile type
  useEffect(() => {
    if (isCompleting) return; // Prevent reopening while closing

    setTimeout(() => {
      // Only show modal for regular profile onboarding
      const isRegularProfile = authProfile.profile_type === "regular" && !user.regular_profile_onboarding_completed;

      if (isRegularProfile) {
        resetModalState();
      }
    }, 1000); // Delay to allow app to settle
  }, [authProfile, user, isCompleting, resetModalState]);

  // Fades out the text content during step transitions
  const fadeOut = () => animateFade(fadeAnim, 0, ANIMATION_DURATIONS.fadeOut);
  // Fades in the text content after step transitions
  const fadeIn = () => animateFade(fadeAnim, 1, ANIMATION_DURATIONS.fadeIn, ANIMATION_DURATIONS.fadeInDelay);

  // Navigates to next step's route (if needed) and fades in new content after delay
  const transitionToNextStep = async (nextStep: OnboardingStep, delay: number) => {
    setCurrentStep(nextStep);
    const route = STEP_ROUTES[nextStep];
    if (route) {
      router.push(route as any);
    }
    setTimeout(() => {
      fadeIn().then(() => {
        setIsTransitioning(false);
      });
    }, delay);
  };

  /**
   * Main navigation handler - advances to next step or completes onboarding.
   * Special handling: welcome→feed also fades background overlay.
   */
  const handleNext = async () => {
    if (isTransitioning) return;

    // Final step: complete onboarding and close
    if (currentStep === "profile") {
      setIsCompleting(true);
      setIsTransitioning(true);
      await animateFadeNonNative(modalFadeAnim, 0, ANIMATION_DURATIONS.fadeOut);
      await completeOnboarding();
      setVisible(false);
      setIsTransitioning(false);
      setTimeout(() => {
        router.push("/(app)/(index)");
      }, 100);
      return;
    }

    setIsTransitioning(true);
    await fadeOut();

    const stepTransitions: Record<
      OnboardingStep,
      { nextStep: OnboardingStep; delay: number; fadeBackground?: boolean }
    > = {
      welcome: { nextStep: "feed", delay: ANIMATION_DURATIONS.welcomeTransitionDelay, fadeBackground: true },
      feed: { nextStep: "explore", delay: ANIMATION_DURATIONS.navigationDelay },
      explore: { nextStep: "addPost", delay: ANIMATION_DURATIONS.navigationDelay },
      addPost: { nextStep: "posts", delay: ANIMATION_DURATIONS.navigationDelay },
      posts: { nextStep: "profile", delay: ANIMATION_DURATIONS.navigationDelay },
      profile: { nextStep: "profile", delay: 0 },
    };

    const transition = stepTransitions[currentStep];
    if (transition.fadeBackground) {
      await animateFade(backgroundFadeAnim, 0, ANIMATION_DURATIONS.backgroundFade);
    }
    await transitionToNextStep(transition.nextStep, transition.delay);
  };

  // Marks onboarding as complete on the backend and updates local user state
  const completeOnboarding = async () => {
    try {
      const { data, error } = await completeOnboardingApi(authProfile.profile_type);
      if (data && !error) {
        updateOnboardingCompleted(authProfile.profile_type);
      } else {
        console.error("Error completing onboarding:", error);
        setIsCompleting(false);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsCompleting(false);
    }
  };

  // Handles closing the modal via X button or back gesture, also completes onboarding
  const handleClose = async () => {
    if (isTransitioning || isCompleting) return;

    setIsCompleting(true);
    setIsTransitioning(true);
    await animateFadeNonNative(modalFadeAnim, 0, ANIMATION_DURATIONS.fadeOut);
    await completeOnboarding();
    setVisible(false);
    setIsTransitioning(false);
  };

  // Returns the title, description, and optional closing message for the current step
  const getStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return {
          title: "Quick Tour",
          description: "Let's give you a quick rundown of the app.",
        };
      case "feed":
        return {
          title: "Feed Tab",
          description:
            "This is where you can see posts from profiles that you follow. Scroll through to discover new content from your friends!",
        };
      case "explore":
        return {
          title: "Explore Tab",
          description:
            "Discover new profiles and content here. Search for profiles, browse trending posts, and find accounts to follow.",
        };
      case "addPost":
        return {
          title: "Add Post Tab",
          description:
            "Create and share your moments here! Upload photos, add captions, and share your pet's adventures with the community.",
          closingMessage: "You'll need to grant camera permissions to use this feature.",
        };
      case "posts":
        return {
          title: "Posts Tab",
          description:
            "View all your posts and notifications here. Keep track of likes, comments, and interactions with your content.",
        };
      case "profile":
        return {
          title: "Profile Tab",
          description:
            "Manage your profile, edit your information, and customize your account settings here. You can also leave feedback for our development team.",
          closingMessage: "That's it for now! Enjoy your time here!",
        };
      default:
        return {
          title: "Welcome to OnlyPaws!",
          description: "Let's give you a quick rundown on the app.",
        };
    }
  };

  const content = getStepContent();
  const closeIconColor = setLightOrDark(COLORS.sky[950], COLORS.zinc[100]);
  const backgroundColor = setLightOrDark(`${COLORS.sky[100]}e6`, `${COLORS.sky[975]}e6`);
  const borderColor = setLightOrDark(COLORS.sky[400], COLORS.sky[500]);
  const backgroundOverlayColor = setLightOrDark(`${COLORS.zinc[100]}CC`, `${COLORS.zinc[950]}CC`);

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      raw
      withScroll={false}
      transparent={true}
      animationType="fade"
    >
      <View style={s.modalContainer}>
        <Animated.View
          style={[s.backgroundOverlay, { backgroundColor: backgroundOverlayColor, opacity: backgroundFadeAnim }]}
        />
        <View style={s.modalContentWrapper}>
          <Animated.View
            style={[
              s.animatedModal,
              {
                backgroundColor,
                borderColor,
                opacity: modalFadeAnim,
              },
            ]}
          >
            <ModalContent
              content={content}
              currentStep={currentStep}
              onClosePress={handleClose}
              onNextPress={handleNext}
              isTransitioning={isTransitioning}
              fadeAnim={fadeAnim}
              closeIconColor={closeIconColor}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default OnboardingModal;

const s = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: "relative",
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContentWrapper: {
    position: "absolute",
    bottom: 100, // Offset for tab bar
    left: 8,
    right: 8,
  },
  animatedModal: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  blurView: {
    padding: 24,
    paddingTop: 32, // Extra space for close button
    paddingBottom: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  contentContainer: {
    paddingBottom: 60, // Space for absolutely positioned button
  },
  textContainer: {
    marginBottom: 24,
  },
  textWrapper: {
    gap: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  descriptionText: {
    textAlign: "center",
    lineHeight: 22,
    fontSize: 16,
  },
  closingMessageText: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    fontWeight: "500",
    fontSize: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
});
