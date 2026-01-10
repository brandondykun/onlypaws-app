import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { ScrollView, StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const AppDetailsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { setLightOrDark } = useColorMode();

  const infoTextColor = setLightOrDark(COLORS.zinc[900], COLORS.zinc[400]);
  const borderBottomColor = setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]);
  const backgroundColor = setLightOrDark(COLORS.zinc[50], COLORS.zinc[900]);

  return (
    <ScrollView
      contentContainerStyle={{ ...s.root, paddingBottom: tabBarHeight + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ ...s.headerText, color: infoTextColor }}>
        The information below helps us identify and resolve issues, so we can continue improving the app and your
        experience.
      </Text>
      <View style={{ ...s.infoContainer, backgroundColor }}>
        <View style={{ ...s.infoItem, borderBottomColor }}>
          <Text style={s.infoLabel}>App Name:</Text>
          <Text style={{ ...s.infoText, color: infoTextColor }}>{Application.applicationName}</Text>
        </View>
        <View style={{ ...s.infoItem, borderBottomColor }}>
          <Text style={s.infoLabel}>App Version:</Text>
          <Text style={{ ...s.infoText, color: infoTextColor }}>{Application.nativeApplicationVersion}</Text>
        </View>
        <View style={{ ...s.infoItem, borderBottomColor }}>
          <Text style={s.infoLabel}>Device Model:</Text>
          <Text style={{ ...s.infoText, color: infoTextColor }}>{Device.modelName}</Text>
        </View>
        <View style={{ ...s.infoItem, borderBottomColor }}>
          <Text style={s.infoLabel}>Manufacturer:</Text>
          <Text style={{ ...s.infoText, color: infoTextColor }}>{Device.manufacturer}</Text>
        </View>
        <View style={{ ...s.infoItem, borderBottomColor }}>
          <Text style={s.infoLabel}>OS Name:</Text>
          <Text style={{ ...s.infoText, color: infoTextColor }}>{Device.osName}</Text>
        </View>
        <View style={{ ...s.infoItem, borderBottomWidth: 0 }}>
          <Text style={s.infoLabel}>OS Version:</Text>
          <Text style={{ ...s.infoText, color: infoTextColor }}>{Device.osVersion}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AppDetailsScreen;

const s = StyleSheet.create({
  root: {
    padding: 16,
    flexGrow: 1,
  },
  infoContainer: {
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 4,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.zinc[700],
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  infoLabel: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 18,
  },
  headerText: {
    marginBottom: 16,
    fontSize: 16,
    paddingHorizontal: 12,
  },
});
