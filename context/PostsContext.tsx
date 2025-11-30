import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { PostDetailed, PostsDetailedPage } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

type PostContextType = {
  addPost: (data: PostDetailed) => void;
  deletePost: (id: number) => void;
  addToCommentCount: (postId: number) => void;
  removeImageFromPost: (postId: number, imageId: number) => void;
  updatePost: (postId: number, data: PostDetailed) => void;
};

const PostsContext = createContext<PostContextType>({
  addPost: (data: PostDetailed) => {},
  deletePost: (id: number) => {},
  addToCommentCount: (postId: number) => {},
  removeImageFromPost: (postId: number, imageId: number) => {},
  updatePost: (postId: number, data: PostDetailed) => {},
});

type Props = {
  children: React.ReactNode;
};

const PostsContextProvider = ({ children }: Props) => {
  const { authProfile, updatePostsCount } = useAuthProfileContext();
  const queryClient = useQueryClient();

  const addPost = (data: PostDetailed) => {
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: ["posts", "authProfile", authProfile.id] },
      (oldData) => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0];
        const updatedFirstPage = {
          ...firstPage,
          results: [{ ...data }, ...(firstPage?.results || [])],
        };

        // Handle infinite query structure
        if (oldData.pages) {
          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          };
        }

        return oldData;
      },
    );
  };

  const deletePost = (id: number) => {
    // Update all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: ["posts", "authProfile", authProfile.id] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              results: page.results?.filter((post) => post.id !== id) ?? page.results,
            })),
          };
        }

        return oldData;
      },
    );
    // update auth profile post count
    updatePostsCount("subtract", 1);
  };

  const addToCommentCount = (postId: number) => {
    // Update the comment count for the post in all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: ["posts", "authProfile", authProfile.id] },
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

  const removeImageFromPost = (postId: number, imageId: number) => {
    // Remove an image from the post in all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: ["posts", "authProfile", authProfile.id] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...post, images: post.images.filter((image) => image.id !== imageId) };
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

  const updatePost = (postId: number, data: PostDetailed) => {
    // Update the post in all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: ["posts", "authProfile", authProfile.id] },
      (oldData) => {
        if (!oldData) return oldData;

        // Handle infinite query structure
        if (oldData.pages) {
          const updatePost = (post: PostDetailed) => {
            if (post.id === postId) {
              return { ...data };
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

  const value = {
    addPost,
    deletePost,
    addToCommentCount,
    removeImageFromPost,
    updatePost,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export default PostsContextProvider;

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePostsContext must be used within PostsContextProvider");
  }
  return context;
};
