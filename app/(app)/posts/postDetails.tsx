import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import Button from "@/components/Button/Button";
import PostSkeleton from "@/components/LoadingSkeletons/PostSkeleton";
import Post from "@/components/Post/Post";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { usePost } from "@/hooks/usePost";

const PostDetailsScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const { setLightOrDark } = useColorMode();
  const { post, error, loading, refetch } = usePost(postId);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <PostSkeleton />
      ) : !error && post ? (
        <Post post={post} captionDefaultExpanded={true} captionExpandable={false} />
      ) : (
        <View style={{ paddingVertical: 64, alignItems: "center", paddingHorizontal: 24 }}>
          <ErrorText>We A-paw-logize!</ErrorText>
          <ErrorText>There was an error fetching this post.</ErrorText>
          <Button
            text="Retry"
            variant="text"
            onPress={refetch}
            textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
            icon={
              <Ionicons name="refresh-outline" size={18} color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />
            }
            buttonStyle={{ marginLeft: -20 }}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default PostDetailsScreen;

const ErrorText = ({ children }: { children: React.ReactNode }) => {
  const { setLightOrDark, isDarkMode } = useColorMode();
  return (
    <Text
      style={{
        color: setLightOrDark(COLORS.zinc[700], COLORS.zinc[400]),
        textAlign: "center",
        fontSize: 20,
        fontWeight: isDarkMode ? "300" : "400",
      }}
    >
      {children}
    </Text>
  );
};
