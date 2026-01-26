import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";

// Safe hook that returns 0 when not in a tab navigator context (e.g., modals)
const useSafeBottomTabBarHeight = () => {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
};

type BaseProps = {
  // Required state flags
  isLoading: boolean;
  isError: boolean;

  // Optional state flags
  isRefetching?: boolean; // Prevents flashing empty state during refresh

  // Custom components
  loadingComponent?: React.ReactNode; // Defaults to ActivityIndicator

  // Styling
  containerStyle?: ViewStyle;
};

// Empty state - either custom component OR messages (not both)
type CustomEmptyProps = {
  customEmptyComponent: React.ReactNode;
  emptyMessage?: never;
  emptySubMessage?: never;
};

type DefaultEmptyProps = {
  customEmptyComponent?: never;
  emptyMessage: string;
  emptySubMessage?: string;
};

type EmptyProps = CustomEmptyProps | DefaultEmptyProps;

// Error state - either custom component OR messages (not both)
type CustomErrorProps = {
  customErrorComponent: React.ReactNode;
  errorMessage?: never;
  errorSubMessage?: never;
};

type DefaultErrorProps = {
  customErrorComponent?: never;
  errorMessage: string;
  errorSubMessage?: string;
};

type ErrorProps = CustomErrorProps | DefaultErrorProps;

type Props = BaseProps & EmptyProps & ErrorProps;

const ListEmptyComponent = ({
  isLoading,
  isError,
  isRefetching = false,
  emptyMessage,
  emptySubMessage,
  errorMessage,
  errorSubMessage,
  loadingComponent,
  customEmptyComponent,
  customErrorComponent,
  containerStyle,
}: Props) => {
  const tabBarHeight = useSafeBottomTabBarHeight();

  // Loading state: show when loading OR when error but refetching
  if (isLoading || (isError && isRefetching)) {
    // Custom loading components handle their own layout
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    // Default ActivityIndicator needs centering container
    return (
      <View style={[s.container, { paddingBottom: tabBarHeight }, containerStyle]}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  }

  // Error state (not refetching)
  if (isError) {
    // Custom error component takes precedence
    if (customErrorComponent) {
      return <>{customErrorComponent}</>;
    }
    return (
      <View style={[s.errorContainer, { paddingBottom: tabBarHeight }, containerStyle]}>
        <Text style={s.errorText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[700]}>
          {errorMessage}
        </Text>
        {errorSubMessage ? (
          <Text style={s.errorSubText} darkColor={COLORS.zinc[600]} lightColor={COLORS.zinc[500]}>
            {errorSubMessage}
          </Text>
        ) : null}
      </View>
    );
  }

  // Custom empty component takes precedence
  if (customEmptyComponent) {
    return <>{customEmptyComponent}</>;
  }

  // Default empty state (only show when not refreshing)
  if (!isRefetching) {
    return (
      <View style={[s.emptyContainer, { paddingBottom: tabBarHeight }, containerStyle]}>
        <Text style={s.emptyMainText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[600]}>
          {emptyMessage}
        </Text>
        {emptySubMessage ? (
          <Text style={s.emptySubText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
            {emptySubMessage}
          </Text>
        ) : null}
      </View>
    );
  }

  return null;
};

export default ListEmptyComponent;

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 72,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 72,
    gap: 12,
  },
  errorText: {
    textAlign: "center",
    fontSize: 20,
    paddingHorizontal: 48,
  },
  errorSubText: {
    textAlign: "center",
    fontSize: 18,
    paddingHorizontal: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginTop: 48,
  },
  emptyMainText: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 36,
  },
  emptySubText: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 36,
  },
});
