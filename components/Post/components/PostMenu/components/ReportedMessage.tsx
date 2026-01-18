import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { PostReportPreview } from "@/types";

type Props = {
  reports: PostReportPreview[];
  isInappropriateContent: boolean;
  setIsInappropriateContent: React.Dispatch<React.SetStateAction<boolean>>;
  postProfileId: number | null;
};

const ReportedMessage = ({ reports, isInappropriateContent, setIsInappropriateContent, postProfileId }: Props) => {
  const { authProfile } = useAuthProfileContext();

  if (!reports.length) return null;

  const reportReasonsArray: string[] = [];

  reports.forEach((reason) => {
    if (reason.reason.id === 1 && !isInappropriateContent) {
      setIsInappropriateContent(true);
    }
    if (!reportReasonsArray.includes(reason.reason.name)) {
      reportReasonsArray.push(reason.reason.name);
    }
  });

  return (
    <View style={{ marginBottom: authProfile.id === postProfileId ? 36 : 0 }}>
      <View style={{ marginBottom: 16, alignItems: "center" }}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.red[600]} />
      </View>
      <Text darkColor={COLORS.zinc[200]} style={{ fontSize: 18, marginBottom: 24, textAlign: "center" }}>
        This post has been reported for:
      </Text>
      <View style={{ marginBottom: 12 }}>
        {reportReasonsArray.map((reason, i) => {
          return (
            <View key={i}>
              <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600", marginBottom: 4 }}>{reason}</Text>
            </View>
          );
        })}
      </View>
      <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, textAlign: "center", marginTop: 24, fontWeight: 300 }}>
        {postProfileId === authProfile.id ? "This post is under review." : ""}
      </Text>
    </View>
  );
};

export default ReportedMessage;
