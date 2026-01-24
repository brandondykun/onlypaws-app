import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../../Text/Text";
import LoadingRetryFooter from "../LoadingRetryFooter/LoadingRetryFooter";

type Props = {
  showEndMessage: boolean;
  isLoading: boolean;
  isError: boolean;
  fetchNextPage: () => void;
};

// Footer component for a list that displays a loading indicator when more data is loading,
// or an error message and a button to retry the fetch when an error occurs.
// It also displays a message when there is no more data to fetch.

const LoadingRetryFooterWithEnd = ({ showEndMessage, isError, isLoading, fetchNextPage }: Props) => {
  // Show message when there is no more data
  if (showEndMessage) {
    return (
      <View style={s.root}>
        <Text style={s.primaryText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
          Oh no! You've hit the end of the line.
        </Text>
        <Text style={s.secondaryText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[700]}>
          We're working hard to get more users so the posts never end!
        </Text>
      </View>
    );
  }

  // Show loading or error message when there is more data but an error occurred
  return (
    <LoadingRetryFooter
      isLoading={isLoading}
      isError={isError}
      fetchNextPage={fetchNextPage}
      message="Oh no! There was an error fetching more posts!"
    />
  );
};

export default LoadingRetryFooterWithEnd;

const s = StyleSheet.create({
  root: {
    paddingVertical: 48,
    gap: 12,
    paddingHorizontal: 24,
  },
  primaryText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "400",
  },
  secondaryText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "400",
  },
});
