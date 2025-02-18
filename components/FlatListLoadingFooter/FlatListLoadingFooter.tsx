import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import LoadingFooter from "../LoadingFooter/LoadingFooter";
import Text from "../Text/Text";

type Props = {
  nextUrl: string | null;
  fetchNextLoading: boolean;
  initialFetchLoading?: boolean;
};

const FlatListLoadingFooter = ({ nextUrl, fetchNextLoading, initialFetchLoading = false }: Props) => {
  const { isDarkMode } = useColorMode();

  if (nextUrl && !fetchNextLoading) return null;
  if ((nextUrl && fetchNextLoading) || initialFetchLoading) {
    return <LoadingFooter />;
  }
  return (
    <View style={{ paddingVertical: 48, gap: 12, paddingHorizontal: 24 }}>
      <Text
        style={{
          color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[700],
          textAlign: "center",
          fontSize: 20,
          fontWeight: "300",
        }}
      >
        Oh no! You've hit the end of the line.
      </Text>
      <Text
        style={{
          color: isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700],
          textAlign: "center",
          fontSize: 16,
          fontWeight: "300",
        }}
      >
        We're working hard to get more users so the posts never end!
      </Text>
    </View>
  );
};

export default FlatListLoadingFooter;
