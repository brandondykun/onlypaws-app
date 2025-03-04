import Entypo from "@expo/vector-icons/Entypo";
import { View } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

type Props = {
  isChecked: boolean;
  size?: number;
  testID?: string;
};

const Checkbox = ({ isChecked, size = 24, testID }: Props) => {
  const { setLightOrDark } = useColorMode();

  return (
    <View
      style={{
        backgroundColor: isChecked ? setLightOrDark(COLORS.zinc[900], COLORS.zinc[200]) : "transparent",
        borderWidth: 1,
        borderColor: isChecked ? "transparent" : setLightOrDark(COLORS.zinc[400], COLORS.zinc[700]),
        width: size,
        height: size,
        borderRadius: size / 4,
        justifyContent: "center",
        alignItems: "center",
      }}
      testID={testID}
    >
      {isChecked ? (
        <Entypo
          name="check"
          size={size - 2}
          color={setLightOrDark(COLORS.zinc[100], COLORS.zinc[900])}
          testID={`${testID}-checked`}
        />
      ) : null}
    </View>
  );
};

export default Checkbox;
