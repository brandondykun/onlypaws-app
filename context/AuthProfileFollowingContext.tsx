import { createContext, useCallback, useContext, useState } from "react";

// Context for sharing search text state between following screen and _layout screen.
// The _layout uses this for the header search input, and the screen uses it for the query.

type AuthProfileFollowingContextType = {
  // Search text state (shared with _layout for header input)
  searchText: string;
  setSearchText: (text: string) => void;
  submittedSearchText: string;
  searchProfiles: () => void;
};

const AuthProfileFollowingContext = createContext<AuthProfileFollowingContextType | null>(null);

type Props = {
  children: React.ReactNode;
};

const AuthProfileFollowingContextProvider = ({ children }: Props) => {
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

  const value: AuthProfileFollowingContextType = {
    searchText,
    setSearchText,
    submittedSearchText,
    searchProfiles,
  };

  return <AuthProfileFollowingContext.Provider value={value}>{children}</AuthProfileFollowingContext.Provider>;
};

export default AuthProfileFollowingContextProvider;

export const useAuthProfileFollowingContext = () => {
  const context = useContext(AuthProfileFollowingContext);
  if (!context) {
    throw new Error("useAuthProfileFollowingContext must be used within AuthProfileFollowingContextProvider");
  }
  return context;
};
