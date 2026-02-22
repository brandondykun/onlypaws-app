import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { Image } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { FollowProfile } from "@/types";

import Text from "../Text/Text";

type Props = {
  profile: FollowProfile;
};

const ICON_SIZE = 52;

const FollowListProfile = ({ profile }: Props) => {
  const { isDarkMode } = useColorMode();

  const profileImage =
    profile.image?.scaled_images?.find((image) => image.scale === "small")?.image || profile.image?.image;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 24,
      }}
      key={profile.id}
    >
      <View style={{ flexDirection: "row", gap: 8, flex: 1 }} key={profile.id}>
        <View>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={{ borderRadius: ICON_SIZE, height: ICON_SIZE, width: ICON_SIZE }}
            />
          ) : (
            <View
              style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
                borderRadius: ICON_SIZE,
                backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[400],
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="paw" size={ICON_SIZE - 20} color={isDarkMode ? COLORS.zinc[600] : COLORS.zinc[300]} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, justifyContent: "center", gap: 2 }}>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>{profile.username}</Text>
          <Text
            style={{
              color: COLORS.zinc[500],
              fontStyle: profile.about ? "normal" : "italic",
              fontSize: 14,
            }}
            numberOfLines={1}
          >
            {profile.about ? profile.about : "No about text"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FollowListProfile;
