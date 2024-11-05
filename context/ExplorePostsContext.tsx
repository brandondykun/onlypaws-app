import { createContext, useContext, useState } from "react";

import { PostDetailed, PostLike } from "@/types";
import { PostCommentDetailed } from "@/types";
import { likePostInState, unlikePostInState, addCommentInState } from "@/utils/utils";

import { useAuthProfileContext } from "./AuthProfileContext";

type ExplorePostsContextType = {
  explorePosts: PostDetailed[];
  setExplorePosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  similarPosts: PostDetailed[];
  setSimilarPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  likePost: (newPostLike: PostLike) => void;
  unlikePost: (postId: number) => void;
  addComment: (comment: PostCommentDetailed, postId: number) => void;
  setSelectedProfilePosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  selectedProfilePosts: PostDetailed[];
};

const ExplorePostsContext = createContext<ExplorePostsContextType>({
  explorePosts: [],
  setExplorePosts: () => {},
  similarPosts: [],
  setSimilarPosts: () => {},
  selectedIndex: null,
  setSelectedIndex: () => {},
  likePost: (newPostLike: PostLike) => {},
  unlikePost: (postId: number) => {},
  addComment: (comment: PostCommentDetailed, postId: number) => {},
  setSelectedProfilePosts: () => {},
  selectedProfilePosts: [],
});

type Props = {
  children: React.ReactNode;
};

const ExplorePostsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();

  const [explorePosts, setExplorePosts] = useState<PostDetailed[]>([]);
  const [similarPosts, setSimilarPosts] = useState<PostDetailed[]>([]);
  const [selectedProfilePosts, setSelectedProfilePosts] = useState<PostDetailed[]>([]);
  // index of selected post to quickly get data for being first in the similar posts list
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // like post wherever it is displayed in the explore tab
  const likePost = (newPostLike: PostLike) => {
    likePostInState(setExplorePosts, newPostLike);
    likePostInState(setSimilarPosts, newPostLike);
    likePostInState(setSelectedProfilePosts, newPostLike);
  };

  // unlike post wherever it is displayed in the explore tab
  const unlikePost = (postId: number) => {
    unlikePostInState(setExplorePosts, postId, authProfile.id!);
    unlikePostInState(setSimilarPosts, postId, authProfile.id!);
    unlikePostInState(setSelectedProfilePosts, postId, authProfile.id!);
  };

  // add comment wherever it is displayed in the explore tab
  const addComment = (comment: PostCommentDetailed, postId: number) => {
    addCommentInState(setExplorePosts, comment, postId);
    addCommentInState(setSimilarPosts, comment, postId);
    addCommentInState(setSelectedProfilePosts, comment, postId);
  };

  const value = {
    explorePosts,
    setExplorePosts,
    setSelectedIndex,
    selectedIndex,
    similarPosts,
    setSimilarPosts,
    likePost,
    unlikePost,
    addComment,
    setSelectedProfilePosts,
    selectedProfilePosts,
  };

  return <ExplorePostsContext.Provider value={value}>{children}</ExplorePostsContext.Provider>;
};

export default ExplorePostsContextProvider;

export const useExplorePostsContext = () => {
  const {
    explorePosts,
    setExplorePosts,
    similarPosts,
    setSimilarPosts,
    selectedIndex,
    setSelectedIndex,
    likePost,
    unlikePost,
    addComment,
    setSelectedProfilePosts,
    selectedProfilePosts,
  } = useContext(ExplorePostsContext);
  return {
    explorePosts,
    setExplorePosts,
    similarPosts,
    setSimilarPosts,
    selectedIndex,
    setSelectedIndex,
    likePost,
    unlikePost,
    addComment,
    setSelectedProfilePosts,
    selectedProfilePosts,
  };
};
