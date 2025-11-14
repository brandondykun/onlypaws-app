import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { createProfile, updateUsername, updateProfile } from "@/api/profile";
import { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

import AboutStep from "../../components/OnBoarding/AboutStep";
import PetDetailsStep from "../../components/OnBoarding/PetDetailsStep";
import UsernameStep from "../../components/OnBoarding/UsernameStep";
import WelcomeStep from "../../components/OnBoarding/WelcomeStep";

const OnboardingMainScreen = () => {
  const { isDarkMode } = useColorMode();
  const { setActiveProfileId, addProfileOption } = useAuthUserContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Profile state
  const [profileId, setProfileId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [name, setName] = useState("");
  const [petType, setPetType] = useState<DropdownSelectOption | null>(null);
  const [breed, setBreed] = useState("");
  const [about, setAbout] = useState("");
  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const [stepLoading, setStepLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const resetOnboarding = () => {
    setProfileId(null);
    setUsername("");
    setName("");
    setPetType(null);
    setBreed("");
    setAbout("");
  };

  // Step 1: Username
  const handleUsernameNext = async (): Promise<string | null> => {
    setStepLoading(true);

    // If profile already exists (user came back), update username
    if (profileId) {
      const { error, data } = await updateUsername(profileId, username);

      if (!error && data) {
        // Don't move to next step yet - wait for fade out animation to complete
        // The UsernameStep component will handle the fade out, then we'll change steps
        setStepLoading(false);
        // Delay step change to allow fade out animation (500ms) to complete
        setTimeout(() => {
          setCurrentStep(1);
        }, 500);
        return null;
      } else if (error) {
        // Error is a string message (e.g., "Username taken. Please try a different username.")
        setStepLoading(false);
        return error;
      } else {
        setStepLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your username. Please try again.",
        });
        return "There was an error updating your username. Please try again.";
      }
    } else {
      // Create new profile with username only (other fields will be updated later)
      const { error, data } = await createProfile(username, "", "", "", undefined);

      if (!error && data) {
        // Store profile ID in context for subsequent steps
        setProfileId(data.id);

        // DON'T add to user context yet - wait until onboarding is complete
        // This prevents the layout guard from thinking onboarding is done
        // and redirecting to main app prematurely

        // Don't move to next step yet - wait for fade out animation to complete
        // The UsernameStep component will handle the fade out, then we'll change steps
        setStepLoading(false);
        // Delay step change to allow fade out animation (500ms) to complete
        setTimeout(() => {
          setCurrentStep(1);
        }, 500);
        return null;
      } else if (error?.username) {
        // Backend validation error - username already taken
        setStepLoading(false);
        return error.username[0];
      } else {
        setStepLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error creating your profile. Please try again.",
        });
        return "There was an error creating your profile. Please try again.";
      }
    }
  };

  // Step 2: Pet Details
  const handlePetDetailsNext = async () => {
    if (!name) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your pet's name.",
      });
      return;
    }

    if (!profileId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Profile not found. Please restart the onboarding process.",
      });
      return;
    }

    setStepLoading(true);

    // Update the profile with pet details
    const { error, data } = await updateProfile(
      {
        name,
        breed: breed || "",
        pet_type: petType?.id || null,
      },
      profileId,
    );

    if (!error && data) {
      // Move to next step
      setCurrentStep(2);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error updating your pet's information. Please try again.",
      });
    }

    setStepLoading(false);
  };

  // Step 3: About (Final step)
  const handleAboutSubmit = async () => {
    if (!profileId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Profile not found. Please restart the onboarding process.",
      });
      return;
    }

    setStepLoading(true);

    // Update the profile with about text (final step)
    const { error, data } = await updateProfile(
      {
        about: about || "",
      },
      profileId,
    );

    if (!error && data) {
      // NOW add the profile to user context (onboarding is complete!)
      addProfileOption({
        id: profileId,
        username: username,
        image: null,
        name: name,
        profile_type: "regular",
      });

      // Show welcome message first
      setShowWelcome(true);
      setStepLoading(false);

      // Wait for fade-in animation (1000ms) + 2 seconds display time, then set active profile and navigate
      setTimeout(() => {
        // Set as active profile - this will trigger profile details fetch
        // We do this AFTER showing the welcome message to prevent premature redirect
        setActiveProfileId(profileId);

        // Clear onboarding data
        resetOnboarding();

        // Navigate to the main app
        // Layout guard will now see user has a profile and allow access
        router.replace("/(app)/(index)");
      }, 3000); // 1000ms fade-in + 2000ms display = 3000ms total
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error finalizing your profile. Please try again.",
      });
      setStepLoading(false);
    }
  };

  const progressStepsStyle = {
    activeStepIconBorderColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[500],
    activeLabelColor: isDarkMode ? COLORS.sky[400] : COLORS.sky[600],
    activeStepNumColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
    activeStepIconColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[500],
    completedStepIconColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[500],
    completedProgressBarColor: isDarkMode ? COLORS.sky[500] : COLORS.sky[500],
    completedCheckColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
    completedLabelColor: isDarkMode ? COLORS.sky[400] : COLORS.sky[600],
    labelColor: isDarkMode ? COLORS.zinc[500] : COLORS.zinc[500],
    disabledStepNumColor: isDarkMode ? COLORS.zinc[500] : COLORS.zinc[50],
    disabledStepIconColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[400],
    progressBarColor: isDarkMode ? COLORS.zinc[500] : COLORS.zinc[400],
    labelSize: 14,
    topOffset: 8,
    marginBottom: 20,
    labelFontSize: 13,
  };

  if (showWelcome) {
    return <WelcomeStep />;
  }

  return (
    <ScrollView
      contentContainerStyle={[s.scrollView, { paddingBottom: insets.bottom }]}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <ProgressSteps activeStep={currentStep} {...progressStepsStyle}>
        <ProgressStep label="Username" removeBtnRow scrollViewProps={{ contentContainerStyle: { flexGrow: 1 } }}>
          <UsernameStep
            username={username}
            setUsername={setUsername}
            onNext={handleUsernameNext}
            loading={stepLoading}
            usernameError={usernameError}
            setUsernameError={setUsernameError}
          />
        </ProgressStep>
        <ProgressStep label="Pet Details" removeBtnRow scrollViewProps={{ contentContainerStyle: { flexGrow: 1 } }}>
          <PetDetailsStep
            onNext={handlePetDetailsNext}
            loading={stepLoading}
            name={name}
            setName={setName}
            petType={petType}
            setPetType={setPetType}
            breed={breed}
            setBreed={setBreed}
          />
        </ProgressStep>
        <ProgressStep label="About" removeBtnRow scrollViewProps={{ contentContainerStyle: { flexGrow: 1 } }}>
          <AboutStep onSubmit={handleAboutSubmit} loading={stepLoading} name={name} about={about} setAbout={setAbout} />
        </ProgressStep>
      </ProgressSteps>
    </ScrollView>
  );
};

export default OnboardingMainScreen;

const s = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    flex: 1,
  },
});
