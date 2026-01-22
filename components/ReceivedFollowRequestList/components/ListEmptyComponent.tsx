import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { InfiniteData, QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import ErrorMessageWithRefresh from "@/components/ErrorMessageWithRefresh/ErrorMessageWithRefresh";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { ListFollowRequestsResponse } from "@/types/follow-requests/follow-requests";

type Props = {
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<InfiniteData<ListFollowRequestsResponse, unknown>, Error>>;
};

const ListEmptyComponent = ({ isLoading, isError, refetch }: Props) => {
  const tabBarHeight = useBottomTabBarHeight();
  if (isLoading) {
    return (
      <View style={{ ...s.loadingContainer, paddingBottom: tabBarHeight }}>
        <ActivityIndicator color={COLORS.zinc[500]} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorMessageWithRefresh
        refresh={refetch}
        errorText="There was an error fetching your received follow requests"
      />
    );
  }

  return (
    <View
      style={{
        ...s.emptyContainer,
        paddingBottom: tabBarHeight,
      }}
    >
      <Text style={s.emptyText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        No received follow requests
      </Text>
    </View>
  );
};

export default ListEmptyComponent;

const s = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 48,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
  },
});
