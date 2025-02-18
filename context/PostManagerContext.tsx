import { createContext, useContext } from "react";

import { PostDetailed } from "@/types";
import {
  likePostInState,
  unlikePostInState,
  savePostInState,
  unSavePostInState,
  addCommentInState,
  togglePostHiddenInState,
  addPostReportedInState,
  removePostInState,
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
    unSavePostInState(exploreProfile.posts.setData, postId);
    unSavePostInState(feedProfile.posts.setData, postId);
    unSavePostInState(postsProfile.posts.setData, postId);
  };

  const onLike = (postId: number) => {
    // like post wherever it appears in the app
    likePostInState(explorePosts.setExplorePosts, postId);
    likePostInState(explorePosts.setSimilarPosts, postId);
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
    addCommentInState(feedPosts.setData, postId);
    addCommentInState(savedPosts.setData, postId);
    addCommentInState(exploreProfile.posts.setData, postId);
    addCommentInState(feedProfile.posts.setData, postId);
    addCommentInState(postsProfile.posts.setData, postId);
  };

  const onToggleHidden = (postId: number) => {
    // toggle is_hidden true or false for post wherever it appears in the app
    togglePostHiddenInState(explorePosts.setExplorePosts, postId);
    togglePostHiddenInState(explorePosts.setSimilarPosts, postId);
    togglePostHiddenInState(feedPosts.setData, postId);
    togglePostHiddenInState(savedPosts.setData, postId);
    togglePostHiddenInState(exploreProfile.posts.setData, postId);
    togglePostHiddenInState(feedProfile.posts.setData, postId);
    togglePostHiddenInState(postsProfile.posts.setData, postId);
  };

  const removePostFromData = (postId: number) => {
    // remove post wherever it appears in the app
    removePostInState(explorePosts.setExplorePosts, postId);
    removePostInState(explorePosts.setSimilarPosts, postId);
    removePostInState(feedPosts.setData, postId);
    removePostInState(savedPosts.setData, postId);
    removePostInState(exploreProfile.posts.setData, postId);
    removePostInState(feedProfile.posts.setData, postId);
    removePostInState(postsProfile.posts.setData, postId);
  };

  const onReportPost = (postId: number, is_inappropriate_content: boolean) => {
    // toggle is_reported true for post wherever it appears in the app
    addPostReportedInState(explorePosts.setExplorePosts, postId);
    addPostReportedInState(explorePosts.setSimilarPosts, postId);
    addPostReportedInState(feedPosts.setData, postId);
    addPostReportedInState(savedPosts.setData, postId);
    addPostReportedInState(exploreProfile.posts.setData, postId);
    addPostReportedInState(feedProfile.posts.setData, postId);
    addPostReportedInState(postsProfile.posts.setData, postId);

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
  const { onLike, onUnlike, onComment, unSavePost, savePost, onToggleHidden, onReportPost } =
    useContext(PostManagerContext);
  return { onLike, onUnlike, onComment, unSavePost, savePost, onToggleHidden, onReportPost };
};
