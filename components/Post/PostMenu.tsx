import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import Text from "../Text/Text";

type Props = {
  onViewProfilePress: () => void;
  onLike: () => void;
  onUnlike: () => void;
  liked: boolean;
};

const PostMenu = forwardRef(
  ({ onViewProfilePress, onLike, onUnlike, liked }: Props, ref: ForwardedRef<RNBottomSheetModal>) => {
    const { isDarkMode } = useColorMode();

    return (
      <BottomSheetModal handleTitle="Post Options" ref={ref} enableDynamicSizing={true} snapPoints={[]}>
        <BottomSheetView style={{ paddingTop: 24, paddingBottom: 48, paddingHorizontal: 36 }}>
          <View
            style={{
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
            }}
          >
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={() => {
                onViewProfilePress();
                if (typeof ref === "object") {
                  ref?.current?.dismiss();
                }
              }}
            >
              <View
                style={[
                  s.profileOption,
                  { borderBottomWidth: 1, borderBottomColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[400] },
                ]}
              >
                <Text style={{ textAlign: "center", fontSize: 18 }}>View Profile</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={() => {
                if (liked) {
                  onUnlike();
                } else {
                  onLike();
                }
              }}
            >
              <View style={[s.profileOption]}>
                <Text style={{ textAlign: "center", fontSize: 18 }}>{liked ? "Unlike Post" : "Like Post"}</Text>
              </View>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

PostMenu.displayName = "PostMenu";
export default PostMenu;

const s = StyleSheet.create({
  profileOption: {
    paddingVertical: 16,
  },
});
