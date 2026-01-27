import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { FollowRequestWithStatus } from "@/types/follow-requests/follow-requests";

import Button from "../Button/Button";
import Pressable from "../Pressable/Pressable";
import ProfileImage from "../ProfileImage/ProfileImage";
import Text from "../Text/Text";

type Props = {
  item: FollowRequestWithStatus;
  acceptRequest: (requestId: number) => Promise<void>;
  declineRequest: (requestId: number) => Promise<void>;
};

const ReceivedFollowRequest = ({ item, acceptRequest, declineRequest }: Props) => {
  const router = useRouter();

  const [acceptLoading, setAcceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);

  const handleAcceptRequest = async () => {
    setAcceptLoading(true);
    await acceptRequest(item.id);
    setAcceptLoading(false);
  };

  const handleDeclineRequest = async () => {
    setDeclineLoading(true);
    await declineRequest(item.id);
    setDeclineLoading(false);
  };

  return (
    <View style={s.root}>
      <Pressable
        style={{ flex: 1, flexDirection: "row", gap: 8 }}
        onPress={() =>
          router.push({
            pathname: "/(app)/posts/profileDetails",
            params: { profileId: item.requester.id, username: item.requester.username },
          })
        }
      >
        <View style={{ justifyContent: "center" }}>
          <ProfileImage image={item?.requester?.image?.image ?? null} size={40} iconSize={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
            {item.requester.username}
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: "400" }}
            numberOfLines={1}
            darkColor={COLORS.zinc[400]}
            lightColor={COLORS.zinc[600]}
          >
            {item.requester.about}
          </Text>
        </View>
      </Pressable>
      {item.status === "accepted" && (
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", width: 100 }}>
          <AntDesign name="check-circle" size={18} color={COLORS.lime[500]} />
          <Text style={{ fontSize: 17, fontWeight: "500" }} darkColor={COLORS.lime[500]} lightColor={COLORS.lime[500]}>
            Accepted
          </Text>
        </View>
      )}
      {item.status === "declined" && (
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", width: 100 }}>
          <AntDesign name="close-circle" size={18} color={COLORS.red[600]} />
          <Text style={{ fontSize: 17, fontWeight: "500" }} darkColor={COLORS.red[600]} lightColor={COLORS.red[500]}>
            Declined
          </Text>
        </View>
      )}
      {item.status === "pending" && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            textStyle={{ fontSize: 13 }}
            text="Accept"
            onPress={handleAcceptRequest}
            buttonStyle={{ height: 30, width: 70 }}
            loading={acceptLoading}
            loadingIconSize={12}
            loadingIconScale={0.7}
            disabled={acceptLoading || declineLoading}
          />
          <Button
            textStyle={{ fontSize: 13 }}
            text="Decline"
            onPress={handleDeclineRequest}
            buttonStyle={{ height: 30, width: 70 }}
            loading={declineLoading}
            loadingIconSize={12}
            loadingIconScale={0.7}
            disabled={declineLoading || acceptLoading}
            variant="outline"
          />
        </View>
      )}
    </View>
  );
};

export default ReceivedFollowRequest;

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
