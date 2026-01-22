import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import { useAuthUserContext } from "@/context/AuthUserContext";

import EmptyPostsMessage from "./components/EmptyPostsMessage";
import PostsErrorMessage from "./components/PostsErrorMessage";
import PrivateProfileMessage from "./components/PrivateProfileMessage";

type Props = {
  postsIsLoading: boolean;
  postsIsRefetching: boolean;
  postsIsError: boolean;
  canViewPosts: boolean | undefined;
  profileId: number | string;
  error: any | null;
};

const EmptyComponent = ({ postsIsLoading, postsIsRefetching, postsIsError, canViewPosts, profileId, error }: Props) => {
  const { selectedProfileId } = useAuthUserContext();
  // If profile is private, show the private profile message immediately
  if (canViewPosts !== undefined && !canViewPosts && selectedProfileId !== profileId) {
    return <PrivateProfileMessage />;
  }

  // If posts are loading or refetching, show a loading skeleton
  if (postsIsLoading || postsIsRefetching) {
    return <PostTileSkeleton />;
  }

  // If posts fetch error and is not a 403 (private profile), show error message
  if (postsIsError && error?.status !== 403) {
    return <PostsErrorMessage />;
  }

  // If no error and can view posts, show the empty posts message
  return <EmptyPostsMessage profileId={profileId} />;
};

export default EmptyComponent;
