import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { SentFollowRequestWithStatus as TSentFollowRequestWithStatus } from "@/types/follow-requests/follow-requests";

import Button from "../Button/Button";
import Pressable from "../Pressable/Pressable";
import ProfileImage from "../ProfileImage/ProfileImage";
import Text from "../Text/Text";

type Props = {
  item: TSentFollowRequestWithStatus;
  cancelRequest: (profileId: number) => Promise<void>;
};

const SentFollowRequest = ({ item, cancelRequest }: Props) => {
  const router = useRouter();

  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancel = async () => {
    if (!item.target.id) return;

    setCancelLoading(true);
    await cancelRequest(item.target.id);
    setCancelLoading(false);
  };

  return (
    <View style={s.root}>
      <Pressable
        style={{ flex: 1, flexDirection: "row", gap: 8 }}
        onPress={() => router.push({ pathname: "/(app)/posts/profileDetails", params: { profileId: item.target.id } })}
      >
        <View style={{ justifyContent: "center" }}>
          <ProfileImage image={item?.target?.image?.image ?? null} size={40} iconSize={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
            {item.target.username}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "400" }} numberOfLines={1}>
            {item.target.about}
          </Text>
        </View>
      </Pressable>
      {item.status === "cancelled" && (
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", width: 100 }}>
          <AntDesign name="close-circle" size={18} color={COLORS.red[600]} />
          <Text style={{ fontSize: 17, fontWeight: "500" }} darkColor={COLORS.red[600]} lightColor={COLORS.red[500]}>
            Cancelled
          </Text>
        </View>
      )}
      {item.status === "accepted" && (
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", width: 100 }}>
          <AntDesign name="check-circle" size={18} color={COLORS.lime[600]} />
          <Text style={{ fontSize: 17, fontWeight: "500" }} darkColor={COLORS.lime[600]} lightColor={COLORS.lime[500]}>
            Accepted
          </Text>
        </View>
      )}
      {item.status === "pending" && (
        <View>
          <Button
            textStyle={{ fontSize: 14 }}
            text="Cancel"
            onPress={handleCancel}
            buttonStyle={{ paddingHorizontal: 8, height: 30, width: 65 }}
            loading={cancelLoading}
            loadingIconSize={12}
            loadingIconScale={0.7}
          />
        </View>
      )}
    </View>
  );
};

export default SentFollowRequest;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    flex: 1,
    marginBottom: 20,
  },
});
