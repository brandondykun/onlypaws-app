import { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

type ColorModeContextType = {
  isDarkMode: boolean;
  setLightOrDark: (lightModeColor: string, darkModeColor: string) => string;
};

const ColorModeContext = createContext<ColorModeContextType>({
  isDarkMode: true,
  setLightOrDark: (lightModeColor: string, darkModeColor: string) => "",
});

type Props = {
  children: React.ReactNode;
};

const ColorModeContextProvider = ({ children }: Props) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const setLightOrDark = (lightModeColor: string, darkModeColor: string) => {
    if (isDarkMode) {
      return darkModeColor;
    }
    return lightModeColor;
  };

  const value = { isDarkMode, setLightOrDark };

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

export default ColorModeContextProvider;

export const useColorMode = () => {
  const { isDarkMode, setLightOrDark } = useContext(ColorModeContext);
  return { isDarkMode, setLightOrDark };
};
