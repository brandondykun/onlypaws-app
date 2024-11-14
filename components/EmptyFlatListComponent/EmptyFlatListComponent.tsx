import { View, ActivityIndicator } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

type Props = {
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  refreshing: boolean;
  emptyText1?: string;
  emptyText2?: string;
  errorText?: string;
};

const EmptyFlatListComponent = ({
  initialFetchComplete,
  hasInitialFetchError,
  refreshing,
  emptyText1 = "Nothing to display.",
  emptyText2 = "",
  errorText = "There was an error. Swipe down to try again.",
}: Props) => {
  if (!initialFetchComplete) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 36,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  } else if (hasInitialFetchError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 36 }}>
        <Text style={{ textAlign: "center", color: COLORS.red[600] }}>{errorText}</Text>
      </View>
    );
  } else if (!hasInitialFetchError && !refreshing && initialFetchComplete) {
    return (
      <View style={{ padding: 48, flex: 1, justifyContent: "center", gap: 12 }}>
        <Text
          style={{
            fontSize: 20,
            textAlign: "center",
            paddingHorizontal: 24,
            fontWeight: "300",
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[700]}
        >
          {emptyText1}
        </Text>
        {emptyText2 ? (
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              paddingHorizontal: 24,
              fontWeight: "300",
            }}
            darkColor={COLORS.zinc[500]}
            lightColor={COLORS.zinc[500]}
          >
            {emptyText2}
          </Text>
        ) : null}
      </View>
    );
  }

  return null;

  // return (
  //   <>
  //     {hasInitialFetchError ? (
  //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 36 }}>
  //         <Text style={{ textAlign: "center", color: COLORS.red[600] }}>{errorText}</Text>
  //       </View>
  //     ) : initialFetchComplete && !refreshing ? (
  //       <View style={{ padding: 48, flex: 1, justifyContent: "center", gap: 12 }}>
  //         <Text
  //           style={{
  //             fontSize: 20,
  //             textAlign: "center",
  //             paddingHorizontal: 24,
  //             fontWeight: "300",
  //           }}
  //           darkColor={COLORS.zinc[400]}
  //           lightColor={COLORS.zinc[700]}
  //         >
  //           {emptyText1}
  //         </Text>
  //         {emptyText2 ? (
  //           <Text
  //             style={{
  //               fontSize: 16,
  //               textAlign: "center",
  //               paddingHorizontal: 24,
  //               fontWeight: "300",
  //             }}
  //             darkColor={COLORS.zinc[500]}
  //             lightColor={COLORS.zinc[500]}
  //           >
  //             {emptyText2}
  //           </Text>
  //         ) : null}
  //       </View>
  //     ) : null}
  //   </>
  // );
};

export default EmptyFlatListComponent;
