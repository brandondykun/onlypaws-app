import { createContext, useCallback, useContext, useState } from "react";

type ProfileSearchContextType = {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  submittedSearchText: string;
  submitSearch: () => void;
};

const ProfileSearchContext = createContext<ProfileSearchContextType>({
  searchText: "",
  setSearchText: () => {},
  submittedSearchText: "",
  submitSearch: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ProfileSearchContextProvider = ({ children }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [submittedSearchText, setSubmittedSearchText] = useState("");

  const submitSearch = useCallback(() => {
    if (searchText.trim()) {
      setSubmittedSearchText(searchText.trim());
    }
  }, [searchText]);

  const value = {
    searchText,
    setSearchText,
    submittedSearchText,
    submitSearch,
  };

  return <ProfileSearchContext.Provider value={value}>{children}</ProfileSearchContext.Provider>;
};

export default ProfileSearchContextProvider;

export const useProfileSearchContext = () => {
  const context = useContext(ProfileSearchContext);
  if (!context) {
    throw new Error("useProfileSearchContext must be used within ProfileSearchContextProvider");
  }
  return context;
};
