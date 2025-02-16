import { createContext, useContext, useState } from "react";

import { PostDetailed } from "@/types";

type ExplorePostsContextType = {
  explorePosts: PostDetailed[];
  setExplorePosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  similarPosts: PostDetailed[];
  setSimilarPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
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

  const value = {
    explorePosts,
    setExplorePosts,
    setSelectedIndex,
    selectedIndex,
    similarPosts,
    setSimilarPosts,
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
    setSelectedProfilePosts,
    selectedProfilePosts,
  };
};
