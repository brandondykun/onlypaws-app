import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { PostDetailed, PostsDetailedPage } from "@/types";

import { useAuthUserContext } from "./AuthUserContext";
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
  const { selectedProfileId } = useAuthUserContext();

  const queryClient = useQueryClient();

  // save a post wherever it appears in the app
  const savePost = (postData: PostDetailed) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postData.id) {
        return { ...prev, is_saved: true };
      }
      return prev;
    });

    // Update all post queries for current profile EXCEPT saved posts (we'll handle that separately)
    // Note: We can't use partial queryKey matching here because we need to exclude "saved" posts
    const allPostQueries = queryClient.getQueriesData<InfiniteData<PostsDetailedPage>>({
      predicate: (query) => {
        const key = query.queryKey;
        // Only match queries for current profile, excluding saved posts
        return key[0] === selectedProfileId && key[1] === "posts" && !key.includes("saved");
      },
    });

    allPostQueries.forEach(([queryKey, oldData]) => {
      if (!oldData?.pages) return;

      queryClient.setQueryData<InfiniteData<PostsDetailedPage>>(queryKey, {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results:
            page.results?.map((post) => (post.id === postData.id ? { ...post, is_saved: true } : post)) ?? page.results,
        })),
      });
    });

    // Special case to add a saved post to the saved posts cache.
    // This ensure that the saved posts are updated locally without having to refetch the posts.
    queryClient.setQueryData<InfiniteData<PostsDetailedPage>>([selectedProfileId, "posts", "saved"], (oldData) => {
      if (!oldData) return oldData;

      // Check if post already exists in saved posts
      const currentIds: number[] = [];
      if (oldData.pages) {
        for (const page of oldData.pages) {
          if (page.results) {
            currentIds.push(...page.results.map((post) => post.id));
          }
        }
      }

      if (currentIds.includes(postData.id)) {
        // Post already exists, just update it
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results:
              page.results?.map((post) => (post.id === postData.id ? { ...post, is_saved: true } : post)) ??
              page.results,
          })),
        };
      }

      // Add the new post to the beginning of the first page
      const firstPage = oldData.pages[0];
      const updatedFirstPage = {
        ...firstPage,
        results: [{ ...postData, is_saved: true }, ...(firstPage?.results || [])],
      };

      return {
        ...oldData,
        pages: [updatedFirstPage, ...oldData.pages.slice(1)],
      };
    });
  };

  // unsave a post wherever it appears in the app
  const unSavePost = (postId: number) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, is_saved: false };
      }
      return prev;
    });

    // Update all post queries for current profile including saved posts
    // For saved posts, we update is_saved to false but don't remove the post
    // It will be removed on the next refetch to avoid abrupt UI changes
    const allPostQueries = queryClient.getQueriesData<InfiniteData<PostsDetailedPage>>({
      queryKey: [selectedProfileId, "posts"],
    });

    allPostQueries.forEach(([queryKey, oldData]) => {
      if (!oldData?.pages) return;

      queryClient.setQueryData<InfiniteData<PostsDetailedPage>>(queryKey, {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results:
            page.results?.map((post) => (post.id === postId ? { ...post, is_saved: false } : post)) ?? page.results,
        })),
      });
    });
  };

  // like a post wherever it appears in the app
  const onLike = (postId: number) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, liked: true, likes_count: prev.likes_count + 1 };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts"] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...post, liked: true, likes_count: post.likes_count + 1 };
            }
            return post;
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.map(updatePost) ?? page.results,
            })),
          };
        }

        return oldData;
      },
    );
  };

  // unlike a post wherever it appears in the app
  const onUnlike = (postId: number) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, liked: false, likes_count: prev.likes_count - 1 };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts"] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...post, liked: false, likes_count: post.likes_count - 1 };
            }
            return post;
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.map(updatePost) ?? page.results,
            })),
          };
        }

        return oldData;
      },
    );
  };

  // add a comment to post wherever it appears in the app
  const onComment = (postId: number) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, comments_count: prev.comments_count + 1 };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts"] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...post, comments_count: post.comments_count + 1 };
            }
            return post;
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.map(updatePost) ?? page.results,
            })),
          };
        }

        return oldData;
      },
    );
  };

  // toggle is_hidden true or false for post wherever it appears in the app
  const onToggleHidden = (postId: number) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, is_hidden: !prev.is_hidden };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts"] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...post, is_hidden: !post.is_hidden };
            }
            return post;
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.map(updatePost) ?? page.results,
            })),
          };
        }

        return oldData;
      },
    );
  };

  // remove post wherever it appears in the app
  const removePostFromData = (postId: number) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return null;
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts"] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.filter((post) => post.id !== postId) ?? page.results,
            })),
          };
        }

        return oldData;
      },
    );
  };

  // toggle is_reported true for post wherever it appears in the app
  const onReportPost = (postId: number, is_inappropriate_content: boolean) => {
    explorePosts.setSelectedExplorePost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, is_hidden: true, is_reported: true };
      }
      return prev;
    });

    // Update all queries for the current profile only
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts"] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...post, is_hidden: true, is_reported: true };
            }
            return post;
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.map(updatePost) ?? page.results,
            })),
          };
        }

        return oldData;
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
