import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { View, Pressable, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  confirmRemoveFollowerSheetRef: React.RefObject<RNBottomSheetModal | null>;
  onRemoveFollowerPress: () => void;
};

const ConfirmRemoveFollowerSheet = ({ confirmRemoveFollowerSheetRef, onRemoveFollowerPress }: Props) => {
  const isDarkMode = useColorMode();

  return (
    <BottomSheetModal
      handleTitle="Options"
      ref={confirmRemoveFollowerSheetRef}
      enableDynamicSizing={true}
      snapPoints={[]}
    >
      <BottomSheetView style={s.bottomSheetView}>
        <View
          style={{
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[50],
          }}
        >
          <Pressable style={({ pressed }) => [pressed && { opacity: 0.5 }]} onPress={onRemoveFollowerPress}>
            <View style={s.optionButton}>
              <MaterialIcons name="remove-circle" size={20} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[800]} />
              <Text style={{ fontSize: 18 }}>Remove Follower</Text>
            </View>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ConfirmRemoveFollowerSheet;

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
});
