import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal as RNBottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { ForwardedRef, forwardRef } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
type Props = {
  onAddProfilePress: () => void;
};

const ICON_SIZE = 38;

const ChangeProfileModal = forwardRef(
  ({ onAddProfilePress }: Props, ref: ForwardedRef<RNBottomSheetModal> | undefined) => {
    const {
      profileOptions,
      changeSelectedProfileId,
      selectedProfileId: authUserSelectedProfileId,
    } = useAuthUserContext();
    const { authProfile, backgroundRefreshing: authProfileLoading } = useAuthProfileContext();
    const { isDarkMode, setLightOrDark } = useColorMode();
    const insets = useSafeAreaInsets();

    const handleChangeProfile = async (profileId: number) => {
      await changeSelectedProfileId(profileId);
    };

    return (
      <BottomSheetModal
        handleTitle="Change Profile"
        ref={ref}
        snapPoints={[]}
        enableDynamicSizing={true}
        enableContentPanningGesture={true}
        style={{ marginTop: insets.top }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + insets.top,
            paddingTop: 24,
            paddingHorizontal: 24,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]),
              borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
              borderRadius: 18,
              borderWidth: 1,
            }}
          >
            {profileOptions?.map((profile, index) => {
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
                        borderBottomColor:
                          index === profileOptions.length - 1
                            ? "transparent"
                            : setLightOrDark(COLORS.zinc[125], COLORS.zinc[900]),
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      {profile.image ? (
                        <Image
                          source={{ uri: profile.image.image }}
                          style={{ borderRadius: ICON_SIZE, height: ICON_SIZE, width: ICON_SIZE }}
                        />
                      ) : (
                        <View
                          style={{
                            height: ICON_SIZE,
                            width: ICON_SIZE,
                            borderRadius: ICON_SIZE,
                            backgroundColor: setLightOrDark(COLORS.zinc[400], COLORS.zinc[600]),
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name="paw"
                            size={ICON_SIZE - 20}
                            color={setLightOrDark(COLORS.zinc[50], COLORS.zinc[800])}
                          />
                        </View>
                      )}
                      <View>
                        <Text style={s.profileOptionText}>{profile.username}</Text>
                        <Text
                          style={{
                            color: setLightOrDark(COLORS.zinc[500], COLORS.zinc[400]),
                            fontStyle: profile.name ? "normal" : "italic",
                            fontSize: 14,
                          }}
                        >
                          {profile.name || "No name"}
                        </Text>
                      </View>
                    </View>
                    {isSelectedButLoading ? (
                      <ActivityIndicator size="small" color={COLORS.lime[500]} />
                    ) : isSelected ? (
                      <Ionicons name="checkmark-circle-sharp" size={28} color={COLORS.lime[500]} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={{ alignItems: "center", paddingTop: 16 }}>
            <Button
              onPress={onAddProfilePress}
              variant="text"
              text="Add Another Profile"
              buttonStyle={{ paddingRight: 8 }}
              icon={<AntDesign name="plus" size={16} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[700]} />}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ChangeProfileModal.displayName = "ChangeProfileModal";

export default ChangeProfileModal;

const s = StyleSheet.create({
  profileOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderStyle: "solid",
  },
  profileOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
