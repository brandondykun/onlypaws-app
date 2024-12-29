import { createContext, useContext } from "react";

import { PostDetailed } from "@/types";
import {
  likePostInState,
  unlikePostInState,
  savePostInState,
  unSavePostInState,
  addCommentInState,
} from "@/utils/utils";

import { useExplorePostsContext } from "./ExplorePostsContext";
import { useExploreProfileDetailsContext } from "./ExploreProfileDetailsContext";
import { useFeedPostsContext } from "./FeedPostsContext";
import { useFeedProfileDetailsContext } from "./FeedProfileDetailsContext";
import { usePostsProfileDetailsContext } from "./PostsProfileDetailsContext";
import { useSavedPostsContext } from "./SavedPostsContext";

// Post manager for all posts in the app
// Any time a post is modified, it should be modified through this manager
// This will ensure that the change is propagated throughout the app so if the
// post appears is another screen, the change will be reflected appropriately

type PostManagerContextType = {
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  onComment: (postId: number) => void;
  savePost: (postData: PostDetailed) => void;
  unSavePost: (postId: number) => void;
};

const PostManagerContext = createContext<PostManagerContextType>({
  onLike: (postId: number) => {},
  onUnlike: (postId: number) => {},
  onComment: (postId: number) => {},
  savePost: (postData: PostDetailed) => {},
  unSavePost: (postId: number) => {},
});

type Props = {
  children: React.ReactNode;
};

const PostManagerContextProvider = ({ children }: Props) => {
  const explorePosts = useExplorePostsContext();
  const feedPosts = useFeedPostsContext();
  const savedPosts = useSavedPostsContext();
  const exploreProfile = useExploreProfileDetailsContext();
  const feedProfile = useFeedProfileDetailsContext();
  const postsProfile = usePostsProfileDetailsContext();

  const savePost = (postData: PostDetailed) => {
    // save post wherever it appears in the app
    savedPosts.savePost(postData); // special behavior for saving a post
    savePostInState(feedPosts.setData, postData.id);
    savePostInState(explorePosts.setExplorePosts, postData.id);
    savePostInState(explorePosts.setSimilarPosts, postData.id);
    savePostInState(explorePosts.setSelectedProfilePosts, postData.id);
    savePostInState(exploreProfile.posts.setData, postData.id);
    savePostInState(feedProfile.posts.setData, postData.id);
    savePostInState(postsProfile.posts.setData, postData.id);
  };

  const unSavePost = (postId: number) => {
    // un-save post wherever it appears in the app
    savedPosts.unSavePost(postId); // special behavior for un-saving a post
    unSavePostInState(feedPosts.setData, postId);
    unSavePostInState(explorePosts.setExplorePosts, postId);
    unSavePostInState(explorePosts.setSimilarPosts, postId);
    unSavePostInState(explorePosts.setSelectedProfilePosts, postId);
    unSavePostInState(exploreProfile.posts.setData, postId);
    unSavePostInState(feedProfile.posts.setData, postId);
    unSavePostInState(postsProfile.posts.setData, postId);
  };

  const onLike = (postId: number) => {
    // like post wherever it appears in the app
    likePostInState(explorePosts.setExplorePosts, postId);
    likePostInState(explorePosts.setSimilarPosts, postId);
    likePostInState(explorePosts.setSelectedProfilePosts, postId);
    likePostInState(feedPosts.setData, postId);
    likePostInState(savedPosts.setData, postId);
    likePostInState(exploreProfile.posts.setData, postId);
    likePostInState(feedProfile.posts.setData, postId);
    likePostInState(postsProfile.posts.setData, postId);
  };

  const onUnlike = (postId: number) => {
    // un-like post wherever it appears in the app
    unlikePostInState(explorePosts.setExplorePosts, postId);
    unlikePostInState(explorePosts.setSimilarPosts, postId);
    unlikePostInState(explorePosts.setSelectedProfilePosts, postId);
    unlikePostInState(feedPosts.setData, postId);
    unlikePostInState(savedPosts.setData, postId);
    unlikePostInState(exploreProfile.posts.setData, postId);
    unlikePostInState(feedProfile.posts.setData, postId);
    unlikePostInState(postsProfile.posts.setData, postId);
  };

  const onComment = (postId: number) => {
    // add comment count to post wherever it appears in the app
    addCommentInState(explorePosts.setExplorePosts, postId);
    addCommentInState(explorePosts.setSimilarPosts, postId);
    addCommentInState(explorePosts.setSelectedProfilePosts, postId);
    addCommentInState(feedPosts.setData, postId);
    addCommentInState(savedPosts.setData, postId);
    addCommentInState(exploreProfile.posts.setData, postId);
    addCommentInState(feedProfile.posts.setData, postId);
    addCommentInState(postsProfile.posts.setData, postId);
  };

  const value = {
    onLike,
    onUnlike,
    onComment,
    unSavePost,
    savePost,
  };

  return <PostManagerContext.Provider value={value}>{children}</PostManagerContext.Provider>;
};

export default PostManagerContextProvider;

export const usePostManagerContext = () => {
  const { onLike, onUnlike, onComment, unSavePost, savePost } = useContext(PostManagerContext);
  return {
    onLike,
    onUnlike,
    onComment,
    unSavePost,
    savePost,
  };
};
