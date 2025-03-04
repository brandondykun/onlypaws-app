import ExpoCheckbox, { CheckboxProps } from "expo-checkbox";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const Checkbox = ({ value, ...props }: CheckboxProps) => {
  const { setLightOrDark } = useColorMode();
  const isChecked = value ?? false;

  return (
    <ExpoCheckbox
      color={
        isChecked
          ? setLightOrDark(COLORS.sky[500], COLORS.sky[500])
          : setLightOrDark(COLORS.zinc[400], COLORS.zinc[800])
      }
      value={value}
      style={{ borderRadius: 4, borderWidth: 1 }}
      {...props}
    />
  );
};

export default Checkbox;
