import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { PostDetailed, PostsDetailedPage } from "@/types";
import { removeInfiniteItemById, updateInfiniteItemById, upsertInfiniteItem } from "@/utils/query/cacheUtils";
import { queryKeys } from "@/utils/query/queryKeys";

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
  const { updatePostsCount, selectedProfileId } = useAuthProfileContext();
  const queryClient = useQueryClient();

  const addPost = (data: PostDetailed) => {
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.authProfile(selectedProfileId) },
      (oldData) => upsertInfiniteItem(oldData, data),
    );
  };

  const deletePost = (id: number) => {
    // Update all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.authProfile(selectedProfileId) },
      (oldData) => removeInfiniteItemById(oldData, id),
    );
    // update auth profile post count
    updatePostsCount("subtract", 1);
  };

  const addToCommentCount = (postId: number) => {
    // Update the comment count for the post in all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.authProfile(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({
          ...post,
          comments_count: post.comments_count + 1,
        }));
      },
    );
  };

  const removeImageFromPost = (postId: number, imageId: number) => {
    // Remove an image from the post in all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.authProfile(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({
          ...post,
          images: post.images.filter((image) => image.id !== imageId),
        }));
      },
    );
  };

  const updatePost = (postId: number, data: PostDetailed) => {
    // Update the post in all queries that might contain posts
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: queryKeys.posts.authProfile(selectedProfileId) },
      (oldData) => {
        return updateInfiniteItemById(oldData, postId, (post) => ({ ...post, ...data }));
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
