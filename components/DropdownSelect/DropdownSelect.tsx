import Entypo from "@expo/vector-icons/Entypo";
import { forwardRef, LegacyRef } from "react";
import { View, StyleSheet } from "react-native";
import SelectDropdown, { SelectDropdownProps } from "react-native-select-dropdown";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

export type DropdownSelectOption = {
  id: number;
  title: string;
};

type Props = {
  data: DropdownSelectOption[];
  defaultText: string;
  label?: string;
} & Omit<SelectDropdownProps, "renderButton" | "renderItem" | "data">;

const DropdownSelect = forwardRef(
  ({ data, defaultText, label, ...props }: Props, ref: LegacyRef<SelectDropdown> | undefined) => {
    const { isDarkMode } = useColorMode();

    return (
      <View style={{ marginVertical: 4, position: "relative" }}>
        {label ? (
          <Text
            style={[
              s.label,
              {
                backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
                color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[500],
              },
            ]}
          >
            {label}
          </Text>
        ) : null}
        <SelectDropdown
          ref={ref}
          data={data}
          renderButton={(selectedItem: DropdownSelectOption, isOpened) => {
            return (
              <View style={s.dropdownButtonStyle}>
                {selectedItem && selectedItem.title ? (
                  <Text style={{ flex: 1, fontSize: 18 }}>{selectedItem.title}</Text>
                ) : (
                  <Text style={{ flex: 1, fontSize: 18, color: isDarkMode ? COLORS.zinc[400] : COLORS.zinc[700] }}>
                    {defaultText}
                  </Text>
                )}
                <Entypo
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]}
                />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View
                style={{
                  ...s.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[300] }),
                }}
              >
                <Text style={s.dropdownItemTxtStyle}>{item.title}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={{ borderRadius: 8, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[200] }}
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
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.zinc[500],
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
    position: "absolute",
    top: -6,
    left: 15,
    zIndex: 2,
    paddingHorizontal: 4,
    fontSize: 12,
  },
});
