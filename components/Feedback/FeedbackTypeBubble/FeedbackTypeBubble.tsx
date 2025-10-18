import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { FeedbackTicketType } from "@/types/feedback/feedback";
import { getReadableFeedbackType } from "@/utils/utils";

import Text from "../../Text/Text";

type Props = {
  ticketType: FeedbackTicketType;
};

const FeedbackTypeBubble = ({ ticketType }: Props) => {
  const { setLightOrDark } = useColorMode();
  return (
    <View
      style={{
        backgroundColor: setLightOrDark(COLORS.sky[200], COLORS.sky[800]),
        borderColor: setLightOrDark(COLORS.sky[300], COLORS.sky[950]),
        marginRight: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
        }}
        darkColor={COLORS.sky[200]}
        lightColor={COLORS.sky[950]}
      >
        {getReadableFeedbackType(ticketType)}
      </Text>
    </View>
  );
};

export default FeedbackTypeBubble;
