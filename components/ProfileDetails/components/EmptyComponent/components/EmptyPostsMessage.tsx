import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { View, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";

type Props = {
  profileId: string;
};

const EmptyPostsMessage = ({ profileId }: Props) => {
  const { authProfile } = useAuthProfileContext();

  return (
    <View style={s.root}>
      <View style={s.iconContainer}>
        <View
          style={{
            borderWidth: 2,
            borderColor: COLORS.zinc[500],
            borderRadius: 100,
            padding: 24,
          }}
        >
          <FontAwesome6 name="dog" size={48} color={COLORS.zinc[500]} />
        </View>
      </View>
      <Text style={s.text} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        {authProfile.public_id === profileId ? "No posts yet! Add a post to see it here." : "No posts yet!"}
      </Text>
    </View>
  );
};

export default EmptyPostsMessage;

const s = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  iconContainer: {
    paddingTop: 72,
    alignItems: "center",
    marginBottom: 24,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 36,
  },
});
