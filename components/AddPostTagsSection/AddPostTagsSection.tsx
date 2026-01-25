import { AntDesign, Entypo } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  taggedUsernames: string[];
  setTagImagesModalVisible: (value: React.SetStateAction<boolean>) => void;
  isEdit: boolean;
};

const AddPostTagsSection = ({ taggedUsernames, setTagImagesModalVisible, isEdit }: Props) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View
      style={{
        marginBottom: 36,
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderColor: setLightOrDark(COLORS.zinc[100], COLORS.zinc[900]),
        paddingVertical: 24,
        paddingHorizontal: 16,
      }}
    >
      <Pressable
        onPress={() => setTagImagesModalVisible(true)}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
          pressed && { opacity: 0.5 },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AntDesign
            name="tag"
            size={15}
            color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])}
            style={{ marginTop: 3 }}
          />
          <Text style={{ fontSize: 18, fontWeight: "400" }}>
            {isEdit ? "Edit tagged profiles" : "Tag profiles in this post"}
          </Text>
        </View>
        <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])} />
      </Pressable>
      {taggedUsernames.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <View>
            <Text
              style={{ fontSize: 14, fontWeight: "500", marginBottom: 8 }}
              darkColor={COLORS.zinc[300]}
              lightColor={COLORS.zinc[800]}
            >
              You tagged {taggedUsernames.length} {taggedUsernames.length === 1 ? "profile" : "profiles"}
            </Text>
          </View>
          <View>
            <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[800]}>
              {taggedUsernames.join(", ")}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default AddPostTagsSection;
