import { createContext, useContext, useState } from "react";

import { PostDetailed } from "@/types";

// Context to share the selected explore post between the explore screen and the explore list screen.
// The selectedExplorePost is used to fetch similar posts.
// It is displayed in the header of the explore list screen as the first post.

type ExplorePostsContextType = {
  selectedExplorePost: PostDetailed | null;
  setSelectedExplorePost: React.Dispatch<React.SetStateAction<PostDetailed | null>>;
};

const ExplorePostsContext = createContext<ExplorePostsContextType>({
  selectedExplorePost: null,
  setSelectedExplorePost: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ExplorePostsContextProvider = ({ children }: Props) => {
  const [selectedExplorePost, setSelectedExplorePost] = useState<PostDetailed | null>(null);

  const value = { selectedExplorePost, setSelectedExplorePost };

  return <ExplorePostsContext.Provider value={value}>{children}</ExplorePostsContext.Provider>;
};

export default ExplorePostsContextProvider;

export const useExplorePostsContext = () => {
  const explorePostsContext = useContext(ExplorePostsContext);
  return explorePostsContext;
};
