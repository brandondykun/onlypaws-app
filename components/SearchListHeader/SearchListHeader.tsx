import { View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

type SearchListHeaderProps = {
  defaultText: string;
  searchText: string;
};

const SearchListHeader = ({ defaultText, searchText }: SearchListHeaderProps) => {
  const displayText = searchText ? `Search results for "${searchText}"` : defaultText;

  return (
    <View style={s.root}>
      <Text style={s.text} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[600]}>
        {displayText}
      </Text>
    </View>
  );
};

export default SearchListHeader;

const s = StyleSheet.create({
  root: {
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    paddingLeft: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
