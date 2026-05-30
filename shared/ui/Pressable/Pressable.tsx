import React from "react";
import { Pressable as RNPressable, PressableProps, PressableStateCallbackType } from "react-native";

interface OpacityPressableProps extends PressableProps {
  activeOpacity?: number;
}

const Pressable: React.FC<OpacityPressableProps> = ({ activeOpacity = 0.5, style, children, ...rest }) => {
  return (
    <RNPressable
      style={(props: PressableStateCallbackType) => [
        typeof style === "function" ? style(props) : style,
        { opacity: props.pressed ? activeOpacity : 1 },
      ]}
      {...rest}
    >
      {children}
    </RNPressable>
  );
};

export default Pressable;
