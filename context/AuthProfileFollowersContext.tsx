import { createContext, useCallback, useContext, useState } from "react";

// Context for sharing search text state between followers screen and _layout screen.
// The _layout uses this for the header search input, and the screen uses it for the query.

type AuthProfileFollowersContextType = {
  // Search text state (shared with _layout for header input)
  searchText: string;
  setSearchText: (text: string) => void;
  submittedSearchText: string;
  searchProfiles: () => void;
};

const AuthProfileFollowersContext = createContext<AuthProfileFollowersContextType | null>(null);

type Props = {
  children: React.ReactNode;
};

const AuthProfileFollowersContextProvider = ({ children }: Props) => {
  // Search state
  const [searchText, setSearchTextState] = useState("");
  const [submittedSearchText, setSubmittedSearchText] = useState("");

  // Custom setter that clears submitted search when input is cleared
  const setSearchText = useCallback((text: string) => {
    setSearchTextState(text);
    // When input is cleared, also clear the submitted search to show original list
    if (!text.trim()) {
      setSubmittedSearchText("");
    }
  }, []);

  // Submit search (called from header input)
  const searchProfiles = () => {
    if (searchText.trim()) {
      setSubmittedSearchText(searchText.trim());
    }
  };

  const value: AuthProfileFollowersContextType = {
    searchText,
    setSearchText,
    submittedSearchText,
    searchProfiles,
  };

  return <AuthProfileFollowersContext.Provider value={value}>{children}</AuthProfileFollowersContext.Provider>;
};

export default AuthProfileFollowersContextProvider;

export const useAuthProfileFollowersContext = () => {
  const context = useContext(AuthProfileFollowersContext);
  if (!context) {
    throw new Error("useAuthProfileFollowersContext must be used within AuthProfileFollowersContextProvider");
  }
  return context;
};
