import { createContext, useContext, useState } from "react";

import { PostDetailed } from "@/types";
import { likePostInState, unlikePostInState, addCommentInState } from "@/utils/utils";

type ExplorePostsContextType = {
  explorePosts: PostDetailed[];
  setExplorePosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  similarPosts: PostDetailed[];
  setSimilarPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  likePost: (postId: number) => void;
  unlikePost: (postId: number) => void;
  addComment: (postId: number) => void;
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
  likePost: (postId: number) => {},
  unlikePost: (postId: number) => {},
  addComment: (postId: number) => {},
  setSelectedProfilePosts: () => {},
  selectedProfilePosts: [],
});

type Props = {
  children: React.ReactNode;
};

const ExplorePostsContextProvider = ({ children }: Props) => {
  const [explorePosts, setExplorePosts] = useState<PostDetailed[]>([]);
  const [similarPosts, setSimilarPosts] = useState<PostDetailed[]>([]);
  const [selectedProfilePosts, setSelectedProfilePosts] = useState<PostDetailed[]>([]);
  // index of selected post to quickly get data for being first in the similar posts list
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // like post wherever it is displayed in the explore tab
  const likePost = (postId: number) => {
    likePostInState(setExplorePosts, postId);
    likePostInState(setSimilarPosts, postId);
    likePostInState(setSelectedProfilePosts, postId);
  };

  // unlike post wherever it is displayed in the explore tab
  const unlikePost = (postId: number) => {
    unlikePostInState(setExplorePosts, postId);
    unlikePostInState(setSimilarPosts, postId);
    unlikePostInState(setSelectedProfilePosts, postId);
  };

  // add comment wherever it is displayed in the explore tab
  const addComment = (postId: number) => {
    addCommentInState(setExplorePosts, postId);
    addCommentInState(setSimilarPosts, postId);
    addCommentInState(setSelectedProfilePosts, postId);
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
