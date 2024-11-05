import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { ScrollView, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";

const ICON_SIZE = 42;

const FollowersScreen = () => {
  const { authProfile } = useAuthProfileContext();
  const isDarkMode = useColorMode();

  let content = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 24 }}>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          paddingHorizontal: 36,
          fontWeight: "300",
        }}
        darkColor={COLORS.zinc[400]}
        lightColor={COLORS.zinc[600]}
      >
        You don't have any followers yet.
      </Text>
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          paddingHorizontal: 36,
          fontWeight: "300",
        }}
        darkColor={COLORS.zinc[500]}
        lightColor={COLORS.zinc[500]}
      >
        Keep posting great content to gain some followers!
      </Text>
    </View>
  );

  if (authProfile.followers.length) {
    content = (
      <View style={{ flex: 1 }}>
        {authProfile.followers.map((profile) => {
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
                        backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[400],
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="paw"
                        size={ICON_SIZE - 20}
                        color={isDarkMode ? COLORS.zinc[600] : COLORS.zinc[300]}
                      />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text style={{ fontWeight: "700", fontSize: 14 }}>{profile.username}</Text>
                  <Text
                    style={{
                      color: COLORS.zinc[500],
                      fontStyle: profile.about ? "normal" : "italic",
                      fontSize: 13,
                    }}
                    numberOfLines={1}
                  >
                    {profile.about ? profile.about : "No about text"}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView>;
};

export default FollowersScreen;
