import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { PostDetailed, PostsDetailedPage } from "@/types";
import { removeInfiniteItemById, updateInfiniteItemById, upsertInfiniteItem } from "@/utils/query/cacheUtils";
import { queryKeys } from "@/utils/query/queryKeys";

import { useAuthProfileContext } from "./AuthProfileContext";
import { useExplorePostsContext } from "./ExplorePostsContext";

// Post manager for all posts in the app
// Any time a post is modified, it should be modified through this manager
// This will ensure that the change is propagated throughout the app so if the
// post appears in another screen, the change will be reflected appropriately

type PostManagerContextType = {
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  onComment: (postId: number) => void;
  savePost: (postData: PostDetailed) => void;
  unSavePost: (postId: number) => void;
  onToggleHidden: (postId: number) => void;
  onReportPost: (postId: number, is_inappropriate_content: boolean) => void;
};

const PostManagerContext = createContext<PostManagerContextType>({
  onLike: (postId: number) => {},
  onUnlike: (postId: number) => {},
  onComment: (postId: number) => {},
  savePost: (postData: PostDetailed) => {},
  unSavePost: (postId: number) => {},
  onToggleHidden: (postId: number) => {},
  onReportPost: (postId: number, is_inappropriate_content: boolean) => {},
});

type Props = {
  children: React.ReactNode;
};

const PostManagerContextProvider = ({ children }: Props) => {
  const explorePosts = useExplorePostsContext();
  const { selectedProfileId } = useAuthProfileContext();

  const queryClient = useQueryClient();

  // save a post wherever it appears in the app
  const savePost = (postData: PostDetailed) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postData.id) {
        return { ...prev, is_saved: true };
      }
      return prev;
    });

    // Update all post queries for current profile EXCEPT saved posts (that is handled separately)
    // Note: predicate is used to explicitly exclude "saved" posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      {
        queryKey: queryKeys.posts.root(selectedProfileId),
        predicate: (query) => {
          const key = query.queryKey;
          return key[0] === selectedProfileId && key[1] === "posts" && !key.includes("saved");
        },
      },
      (oldData) => {
        return updateInfiniteItemById(oldData, postData.id, (post) => ({ ...post, is_saved: true }));
      },
    );

    // Special case to add a saved post to the saved posts cache.
    // This ensure that the saved posts are updated locally without having to refetch the posts.
    queryClient.setQueryData<InfiniteData<PostsDetailedPage>>(queryKeys.posts.saved(selectedProfileId), (oldData) => {
      const updated = { ...postData, is_saved: true };
      return upsertInfiniteItem(oldData, updated);
    });
  };

  // unsave a post wherever it appears in the app
  const unSavePost = (postId: number) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, is_saved: false };
      }
      return prev;
    });

    // Update all post queries for current profile including saved posts
    // For saved posts, we update is_saved to false but don't remove the post
    // It will be removed on the next refetch to avoid abrupt UI changes
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => updateInfiniteItemById(oldData, postId, (post) => ({ ...post, is_saved: false })),
    );
  };

  // like a post wherever it appears in the app
  const onLike = (postId: number) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, liked: true, likes_count: prev.likes_count + 1 };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({
          ...post,
          liked: true,
          likes_count: post.likes_count + 1,
        }));
      },
    );
  };

  // unlike a post wherever it appears in the app
  const onUnlike = (postId: number) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, liked: false, likes_count: prev.likes_count - 1 };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({
          ...post,
          liked: false,
          likes_count: post.likes_count - 1,
        }));
      },
    );
  };

  // add a comment to post wherever it appears in the app
  const onComment = (postId: number) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, comments_count: prev.comments_count + 1 };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({
          ...post,
          comments_count: post.comments_count + 1,
        }));
      },
    );
  };

  // toggle is_hidden true or false for post wherever it appears in the app
  const onToggleHidden = (postId: number) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, is_hidden: !prev.is_hidden };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => updateInfiniteItemById(oldData, postId, (post) => ({ ...post, is_hidden: !post.is_hidden })),
    );
  };

  // remove post wherever it appears in the app
  const removePostFromData = (postId: number) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return null;
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => removeInfiniteItemById(oldData, postId),
    );
  };

  // toggle is_reported true for post wherever it appears in the app
  const onReportPost = (postId: number, is_inappropriate_content: boolean) => {
    // update the selected explore post, which is a post stored in state and not a query
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, is_hidden: true, is_reported: true };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.root(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({ ...post, is_hidden: true, is_reported: true }));
      },
    );

    // if post was reported as inappropriate, remove it from wherever it appears in the app
    if (is_inappropriate_content) {
      removePostFromData(postId);
    }
  };

  const value = {
    onLike,
    onUnlike,
    onComment,
    unSavePost,
    savePost,
    onToggleHidden,
    onReportPost,
  };

  return <PostManagerContext.Provider value={value}>{children}</PostManagerContext.Provider>;
};

export default PostManagerContextProvider;

export const usePostManagerContext = () => {
  const context = useContext(PostManagerContext);
  if (!context) {
    throw new Error("usePostManagerContext must be used within PostManagerContextProvider");
  }
  return context;
};
