import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import BottomSheet from "@/shared/ui/BottomSheet/BottomSheet";
import Button from "@/shared/ui/Button/Button";
import TextInput from "@/shared/ui/TextInput/TextInput";

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

type DatePickerProps = {
  /** Selected date as YYYY-MM-DD string, or null if no date selected */
  value: string | null;
  /** Called with YYYY-MM-DD string when the user selects a date */
  onChange: (dateStr: string) => void;
  /** Label displayed above the input */
  label?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Title displayed in the bottom sheet header */
  sheetTitle?: string;
  /** Text for the save button in the bottom sheet */
  doneButtonText?: string;
  /** Error message to display below the input */
  error?: string;
  /** Maximum selectable date (defaults to today) */
  maximumDate?: Date;
  /** Minimum selectable date (defaults to 40 years ago) */
  minimumDate?: Date;
  /** Style override for the outermost container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style override for the Pressable wrapper */
  pressableStyle?: StyleProp<ViewStyle>;
  /** Style override for the icon container */
  iconStyle?: StyleProp<ViewStyle>;
  /** Style override for the bottom sheet picker area */
  pickerContainerStyle?: StyleProp<ViewStyle>;
  /** Called when the user clears the date. When provided, a Clear button is shown. */
  onClear?: () => void;
};

const DatePicker = ({
  value,
  onChange,
  label = "Date",
  placeholder = "Tap to select a date",
  sheetTitle = "Select Date",
  doneButtonText = "Save",
  error,
  maximumDate = new Date(),
  minimumDate = new Date(`${new Date().getFullYear() - 40}-01-01`),
  containerStyle,
  pressableStyle,
  iconStyle,
  pickerContainerStyle,
  onClear,
}: DatePickerProps) => {
  const { setLightOrDark, isDarkMode } = useColorMode();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const valueOnOpenRef = useRef<string | null>(value);
  const [pendingValue, setPendingValue] = useState<string | null>(value);

  const handleOpen = useCallback(() => {
    valueOnOpenRef.current = value;
    setPendingValue(value ?? formatDate(new Date()));
    bottomSheetRef.current?.present();
  }, [value]);

  const handleSave = useCallback(() => {
    if (pendingValue && pendingValue !== value) {
      onChange(pendingValue);
    }
    bottomSheetRef.current?.dismiss();
  }, [pendingValue, value, onChange]);

  const handleCancel = useCallback(() => {
    setPendingValue(valueOnOpenRef.current);
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  return (
    <View style={containerStyle}>
      <View style={{ position: "relative" }}>
        <Pressable onPress={handleOpen} style={({ pressed }) => [pressed && { opacity: 0.7 }, pressableStyle]}>
          <View pointerEvents="none">
            <TextInput
              label={label}
              value={value ? formatDisplayDate(value) : ""}
              onChangeText={() => {}}
              placeholder={placeholder}
              editable={false}
              error={error}
            />
          </View>
        </Pressable>
        <View
          style={[
            {
              position: "absolute",
              right: 12,
              top: 6,
              bottom: 0,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              zIndex: 5,
            },
            iconStyle,
          ]}
          pointerEvents="box-none"
        >
          {value && onClear ? (
            <Pressable onPress={handleClear} hitSlop={8} style={{ padding: 2 }}>
              <Ionicons name="close-circle" size={20} color={setLightOrDark(COLORS.zinc[400], COLORS.zinc[500])} />
            </Pressable>
          ) : null}
          <Pressable onPress={handleOpen}>
            <Ionicons name="calendar-outline" size={20} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[400])} />
          </Pressable>
        </View>
      </View>
      <BottomSheet
        handleTitle={sheetTitle}
        ref={bottomSheetRef}
        snapPoints={[]}
        enableDynamicSizing={true}
        backgroundStyle={{ backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[925]) }}
      >
        <BottomSheetView style={{ paddingBottom: 48 }}>
          <View style={[{ alignItems: "center", paddingBottom: 24, paddingTop: 8 }, pickerContainerStyle]}>
            <DateTimePicker
              value={pendingValue ? new Date(pendingValue + "T00:00:00") : new Date()}
              mode="date"
              display="spinner"
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              themeVariant={isDarkMode ? "dark" : "light"}
              style={{ width: "100%" }}
              onChange={(_event, date) => {
                if (date) {
                  setPendingValue(formatDate(date));
                }
              }}
              textColor={setLightOrDark(COLORS.zinc[950], COLORS.zinc[200])}
            />
          </View>
          <View style={{ flexDirection: "row", paddingHorizontal: 24, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button variant="outline" text="Cancel" onPress={handleCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="primary" text={doneButtonText} onPress={handleSave} />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default DatePicker;
