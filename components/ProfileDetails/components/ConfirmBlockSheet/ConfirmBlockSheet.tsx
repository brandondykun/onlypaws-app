import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { View, Pressable, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  confirmBlockSheetRef: React.RefObject<RNBottomSheetModal | null>;
  onBlockPress: () => void;
};

const ConfirmBlockSheet = ({ confirmBlockSheetRef, onBlockPress }: Props) => {
  const isDarkMode = useColorMode();

  return (
    <BottomSheetModal handleTitle="Block Profile" ref={confirmBlockSheetRef} enableDynamicSizing={true} snapPoints={[]}>
      <BottomSheetView style={s.bottomSheetView}>
        <Text style={s.description}>
          They won't be able to find your profile or posts. They won't be notified that you blocked them.
        </Text>
        <View
          style={{
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[50],
          }}
        >
          <Pressable style={({ pressed }) => [pressed && { opacity: 0.5 }]} onPress={onBlockPress}>
            <View style={s.optionButton}>
              <MaterialIcons name="block" size={20} color={COLORS.red[500]} />
              <Text style={{ fontSize: 18, color: COLORS.red[500] }}>Block Profile</Text>
            </View>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ConfirmBlockSheet;

const s = StyleSheet.create({
  optionButton: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  bottomSheetView: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 36,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
});
