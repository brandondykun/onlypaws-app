import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Button from "@/components/Button/Button";
import { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import DropdownSelect from "@/components/DropdownSelect/DropdownSelect";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { usePetTypeOptions } from "@/hooks/usePetTypeOptions";
import toast from "@/utils/toast";

type PetDetailsStepProps = {
  onNext: () => Promise<void>;
  loading: boolean;
  name: string;
  setName: (name: string) => void;
  petType: DropdownSelectOption | null;
  setPetType: (petType: DropdownSelectOption) => void;
  breed: string;
  setBreed: (breed: string) => void;
};

const PetDetailsStep = ({
  onNext,
  loading,
  name,
  setName,
  petType,
  setPetType,
  breed,
  setBreed,
}: PetDetailsStepProps) => {
  const { isDarkMode, setLightOrDark } = useColorMode();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: petTypeOptions } = usePetTypeOptions();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }, [fadeAnim]);

  const handleNext = async () => {
    if (!name) {
      toast.error("Please enter your pet's name.");
      return;
    }

    // Disable button during fade out to prevent re-clicking
    setIsTransitioning(true);
    await fadeOut();
    await onNext();
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={{ paddingBottom: 24, gap: 16 }}>
        <Text
          style={{ fontSize: 26, fontWeight: "600", textAlign: "center" }}
          darkColor={COLORS.sky[400]}
          lightColor={COLORS.sky[500]}
        >
          Tell Us About Your Pet
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: "300", textAlign: "center" }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          Help others get to know your furry friend!
        </Text>
      </View>

      <View style={{ flex: 1, gap: 12 }}>
        <TextInput
          label="Pet Name"
          value={name}
          onChangeText={setName}
          placeholder="Fido"
          icon={<Ionicons name="paw" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />}
        />
        <View style={{ marginBottom: 16 }}>
          <DropdownSelect
            defaultText="Select a pet type (optional)"
            data={petTypeOptions || []}
            onSelect={(selectedItem) => setPetType(selectedItem)}
            label="Pet Type"
            defaultValue={petType}
            dropdownStyle={{
              borderRadius: 8,
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
              height: 300,
            }}
          />
        </View>
        <TextInput label="Breed (optional)" value={breed} onChangeText={setBreed} placeholder="Golden Retriever" />
      </View>
      <Button text="Next" onPress={handleNext} loading={loading || isTransitioning} />
    </Animated.View>
  );
};

export default PetDetailsStep;

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
});
