import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchProfiles } from "@/api/profile";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { SearchedProfile } from "@/types";

import Button from "../Button/Button";
import HeaderSearchInput from "../HeaderSearchInput/HeaderSearchInput";
import LoadingFooter from "../LoadingFooter/LoadingFooter";
import Modal from "../Modal/Modal";
import RetryFetchFooter from "../RetryFetchFooter/RetryFetchFooter";
import SearchedProfilePreview from "../SearchedProfilePreview/SearchedProfilePreview";
import Text from "../Text/Text";

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  handleProfileSelection: (profile: SearchedProfile) => void;
  handleProfileSelectionCancel: () => void;
  excludedProfileIds: number[];
};

const ProfileSearchModal = ({
  visible,
  setVisible,
  handleProfileSelection,
  handleProfileSelectionCancel,
  excludedProfileIds,
}: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const initialFetch = useCallback(async () => {
    const { data, error } = await searchProfiles(searchText);
    return { data, error };
  }, [searchText]);

  useEffect(() => {
    setSearchText("");
  }, [visible]);

  const {
    data,
    fetchInitial,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
  } = usePaginatedFetch<SearchedProfile>(initialFetch, {
    onRefresh: () => Haptics.impactAsync(),
    enabled: false, // disable initially - search is manually called
  });

  const handleSearch = useCallback(async () => {
    await fetchInitial();
  }, [fetchInitial]);

  const filteredData = data.filter((profile) => !excludedProfileIds.includes(profile.id));

  const emptyComponent = !initialFetchComplete ? (
    <View style={{ paddingTop: 72 }}>
      <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "400", color: COLORS.zinc[500] }}>
        Enter a username to search.
      </Text>
    </View>
  ) : hasInitialFetchError ? (
    <View style={{ paddingTop: 72 }}>
      <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "400", color: COLORS.red[600] }}>
        There was an error with that search.
      </Text>
      <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "400", color: COLORS.red[600] }}>
        Please try again.
      </Text>
    </View>
  ) : (
    <View style={{ paddingTop: 72 }}>
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          paddingHorizontal: 36,
          fontWeight: "400",
        }}
        darkColor={COLORS.zinc[400]}
        lightColor={COLORS.zinc[600]}
      >
        No profiles found with that username.
      </Text>
    </View>
  );

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <LoadingFooter />
  ) : hasFetchNextError ? (
    <RetryFetchFooter
      fetchFn={fetchNext}
      message="Oh no! There was an error fetching more profiles!"
      buttonText="Retry"
    />
  ) : null;

  return (
    <Modal
      visible={visible}
      onRequestClose={handleProfileSelectionCancel}
      animationType="slide"
      withScroll={false}
      backgroundColor={setLightOrDark(COLORS.zinc[100], COLORS.zinc[950])}
    >
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flexGrow: 1 }}>
        <View style={{ marginBottom: 12, position: "relative" }}>
          <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600" }}>Search Profiles</Text>
          <View style={{ position: "absolute", right: 12, top: 0 }}>
            <Button
              variant="text"
              text="Cancel"
              onPress={handleProfileSelectionCancel}
              buttonStyle={{ height: "auto" }}
              textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
            />
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
          }}
        >
          <HeaderSearchInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="Search profiles..."
          />
        </View>
        <FlashList
          contentContainerStyle={{ paddingTop: Platform.OS === "android" ? 0 : 12, flexGrow: 1 }}
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={emptyComponent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: profile, index }) => (
            <SearchedProfilePreview
              profile={profile}
              showFollowButtons={false}
              key={profile.id}
              onPress={() => {
                handleProfileSelection(profile);
              }}
            />
          )}
          onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
          onEndReached={!fetchNextLoading ? () => fetchNext() : null} // prevent from being called twice
          ListFooterComponent={footerComponent}
        />
      </View>
    </Modal>
  );
};

export default ProfileSearchModal;
