import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  onAddProfilePress: () => void;
};

const ChangeProfileModal = forwardRef(
  ({ onAddProfilePress }: Props, ref: ForwardedRef<RNBottomSheetModal> | undefined) => {
    const {
      profileOptions,
      changeSelectedProfileId,
      selectedProfileId: authUserSelectedProfileId,
    } = useAuthUserContext();
    const { authProfile, loading: authProfileLoading } = useAuthProfileContext();
    const { isDarkMode } = useColorMode();

    const handleChangeProfile = async (profileId: number) => {
      await changeSelectedProfileId(profileId);
    };

    return (
      <BottomSheetModal
        handleTitle="Change Profile"
        ref={ref}
        snapPoints={["50%", "90%"]}
        enableContentPanningGesture={true}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: 48,
            paddingTop: 18,
            paddingHorizontal: 24,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {profileOptions?.map((profile) => {
            const isSelected = profile.id === authProfile.id;
            const isSelectedButLoading = authUserSelectedProfileId === profile.id && authProfileLoading;
            return (
              <Pressable
                key={profile.id}
                style={({ pressed }) => [pressed && !isSelected && { opacity: 0.7 }]}
                disabled={isSelected || authProfileLoading}
                onPress={() => handleChangeProfile(profile.id)}
              >
                <View
                  style={[
                    s.profileOption,
                    {
                      backgroundColor: isDarkMode ? COLORS.zinc[600] : COLORS.zinc[50],
                      borderColor:
                        isSelected && isDarkMode
                          ? COLORS.lime[600]
                          : isSelected
                            ? COLORS.lime[500]
                            : isDarkMode
                              ? COLORS.zinc[800]
                              : COLORS.zinc[200],
                    },
                  ]}
                >
                  <Text style={s.profileOptionText}>{profile.username}</Text>
                  {isSelected ? <Ionicons name="checkmark-circle-sharp" size={24} color={COLORS.lime[500]} /> : null}
                  {isSelectedButLoading ? <ActivityIndicator size="small" color={COLORS.lime[500]} /> : null}
                </View>
              </Pressable>
            );
          })}
          <View style={{ paddingTop: 16, paddingLeft: 8 }}>
            <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 16, fontStyle: "italic" }}>
              Have another pet?
            </Text>
          </View>
          <Pressable
            onPress={onAddProfilePress}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            disabled={authProfileLoading}
          >
            <View
              style={[
                s.profileOption,
                {
                  backgroundColor: isDarkMode ? COLORS.zinc[600] : COLORS.zinc[50],
                  borderColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200],
                },
              ]}
            >
              <Text style={[s.profileOptionText, { color: isDarkMode ? COLORS.zinc[300] : COLORS.zinc[700] }]}>
                Add Another Profile
              </Text>
              <AntDesign name="pluscircle" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[700]} />
            </View>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ChangeProfileModal.displayName = "ChangeProfileModal";

export default ChangeProfileModal;

const s = StyleSheet.create({
  profileOption: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
  },
  profileOptionText: {
    fontSize: 16,
  },
});
