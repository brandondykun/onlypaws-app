import { useState } from "react";
import { TabView, SceneMap, TabBar, TabBarProps } from "react-native-tab-view";

import ReceivedFollowRequestList from "@/components/ReceivedFollowRequestList/ReceivedFollowRequestList";
import SentFollowRequestList from "@/components/SentFollowRequestList/SentFollowRequestList";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useFollowRequestsContext } from "@/context/FollowRequestsContext";

const renderScene = SceneMap({
  first: () => {
    return <ReceivedFollowRequestList />;
  },
  second: () => {
    return <SentFollowRequestList />;
  },
});

const FollowRequestsScreen = () => {
  const { hasReceivedRequests } = useFollowRequestsContext();

  const { setLightOrDark } = useColorMode();
  const [index, setIndex] = useState(hasReceivedRequests ? 0 : 1);

  const [routes] = useState([
    { key: "first", title: "Received" },
    { key: "second", title: "Sent" },
  ]);

  const renderTabBar = (props: TabBarProps<{ key: string; title: string }>) => (
    <TabBar
      {...props}
      style={{
        backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]),
        borderBottomWidth: 1,
        borderBottomColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
      }}
      activeColor={setLightOrDark(COLORS.sky[600], COLORS.sky[500])}
      inactiveColor={setLightOrDark(COLORS.zinc[400], COLORS.zinc[400])}
      indicatorStyle={{ backgroundColor: setLightOrDark(COLORS.sky[500], COLORS.sky[500]), marginBottom: -1 }}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={renderTabBar}
      options={{
        first: {
          labelStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
        },
        second: {
          labelStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
        },
      }}
    />
  );
};

export default FollowRequestsScreen;
