import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef, ForwardedRef, useRef, useImperativeHandle } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import SelectDropdown, { SelectDropdownProps } from "react-native-select-dropdown";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import Text from "@/shared/ui/Text/Text";

export type DropdownSelectOption = {
  id: number;
  title: string;
};

type Props = {
  data: DropdownSelectOption[];
  defaultText: string;
  label?: string;
  onClear?: () => void;
} & Omit<SelectDropdownProps, "renderButton" | "renderItem" | "data">;

const DropdownSelect = forwardRef(
  ({ data, defaultText, label, onClear, ...props }: Props, ref: ForwardedRef<SelectDropdown>) => {
    const { setLightOrDark } = useColorMode();
    const internalRef = useRef<SelectDropdown>(null);
    useImperativeHandle(ref, () => internalRef.current as SelectDropdown);

    return (
      <View style={{ marginVertical: 4, position: "relative" }}>
        {label ? (
          <Text
            style={[
              s.label,
              {
                backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]),
                color: setLightOrDark(COLORS.zinc[500], COLORS.zinc[400]),
              },
            ]}
          >
            {label}
          </Text>
        ) : null}
        <SelectDropdown
          ref={internalRef}
          data={data}
          renderButton={(selectedItem: DropdownSelectOption, isOpened) => {
            return (
              <View
                style={[
                  s.dropdownButtonStyle,
                  {
                    backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[900]),
                    borderColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]),
                  },
                ]}
              >
                {selectedItem && selectedItem.title ? (
                  <Text style={{ flex: 1, fontSize: 18 }}>{selectedItem.title}</Text>
                ) : (
                  <Text style={{ flex: 1, fontSize: 18, color: setLightOrDark(COLORS.zinc[700], COLORS.zinc[400]) }}>
                    {defaultText}
                  </Text>
                )}
                {selectedItem && onClear ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      internalRef.current?.reset();
                      onClear();
                    }}
                    hitSlop={8}
                    style={{ padding: 2, marginRight: 4 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={setLightOrDark(COLORS.zinc[400], COLORS.zinc[500])}
                    />
                  </Pressable>
                ) : null}
                <Entypo
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[300])}
                />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View
                style={{
                  ...s.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[700]) }),
                }}
                accessible={true}
                accessibilityLabel={item.title}
              >
                <Text style={s.dropdownItemTxtStyle}>{item.title}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={{ borderRadius: 8, backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]) }}
          {...props}
        />
      </View>
    );
  },
);

DropdownSelect.displayName = "DropdownSelect";
export default DropdownSelect;

const s = StyleSheet.create({
  dropdownButtonStyle: {
    width: "100%",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: "solid",
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
  },
  label: {
    width: "auto",
    zIndex: 2,
    paddingHorizontal: 4,
    fontSize: 13,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
