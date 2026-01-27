import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchProfilesForQuery } from "@/api/profile";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { SearchedProfile } from "@/types";
import { getNextPageParam } from "@/utils/utils";

import Button from "../Button/Button";
import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import HeaderSearchInput from "../HeaderSearchInput/HeaderSearchInput";
import ListEmptyComponent from "../ListEmptyComponent/ListEmptyComponent";
import Modal from "../Modal/Modal";
import SearchedProfilePreview from "../SearchedProfilePreview/SearchedProfilePreview";
import SearchListHeader from "../SearchListHeader/SearchListHeader";
import Text from "../Text/Text";

type Props = {
  visible: boolean;
  handleProfileSelection: (profile: SearchedProfile) => void;
  handleProfileSelectionCancel: () => void;
  excludedProfileIds: number[];
};

const ProfileSearchModal = ({
  visible,
  handleProfileSelection,
  handleProfileSelectionCancel,
  excludedProfileIds,
}: Props) => {
  const { setLightOrDark } = useColorMode();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");
  const [submittedSearchText, setSubmittedSearchText] = useState("");

  useEffect(() => {
    setSearchText("");
    setSubmittedSearchText("");
  }, [visible]);

  const fetchProfiles = async ({ pageParam }: { pageParam: string }) => {
    const res = await searchProfilesForQuery(submittedSearchText, pageParam);
    return res.data;
  };

  const profileSearch = useInfiniteQuery({
    queryKey: ["profileSearchModal", submittedSearchText],
    queryFn: fetchProfiles,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!submittedSearchText,
  });

  const data = useMemo(() => {
    return profileSearch.data?.pages.flatMap((page) => page.results) ?? [];
  }, [profileSearch.data]);

  const handleSearch = useCallback(() => {
    setSubmittedSearchText(searchText);
  }, [searchText]);

  const handleEndReached = () => {
    const hasErrors = profileSearch.isError || profileSearch.isFetchNextPageError;
    const isLoading = profileSearch.isLoading || profileSearch.isFetchingNextPage;
    if (profileSearch.hasNextPage && !hasErrors && !isLoading) {
      profileSearch.fetchNextPage();
    }
  };

  const filteredData = data.filter((profile) => !excludedProfileIds.includes(profile.id));

  // Custom empty component for search states
  const searchEmptyComponent = (
    <View style={{ marginTop: 48 }}>
      <Text style={{ textAlign: "center", fontSize: 20, color: COLORS.zinc[500] }}>
        {!submittedSearchText ? "Enter a username to search" : "No results found"}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={handleProfileSelectionCancel}
      animationType="slide"
      withScroll={false}
      backgroundColor={setLightOrDark(COLORS.zinc[200], COLORS.zinc[950])}
    >
      <View style={{ paddingTop: insets.top + 10, flexGrow: 1 }}>
        <View style={{ marginBottom: 12, position: "relative" }}>
          <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600" }}>Search Profiles</Text>
          <View style={{ position: "absolute", left: 12, top: 0 }}>
            <Button
              variant="text"
              text="Cancel"
              onPress={handleProfileSelectionCancel}
              buttonStyle={{ height: "auto", paddingHorizontal: 8 }}
              textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]), fontSize: 20, marginTop: -2 }}
            />
          </View>
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <HeaderSearchInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="Search profiles..."
            rootStyle={{ paddingRight: 0, marginTop: 16 }}
          />
        </View>
        <FlashList
          data={filteredData}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 64 }}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={profileSearch.refetch}
          onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
          onEndReached={handleEndReached}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<SearchListHeader defaultText="" searchText={submittedSearchText} />}
          ListEmptyComponent={
            <ListEmptyComponent
              isLoading={profileSearch.isLoading}
              isError={profileSearch.isError}
              isRefetching={profileSearch.isRefetching}
              errorMessage="There was an error with that search."
              errorSubMessage="Please try again."
              customEmptyComponent={searchEmptyComponent}
              containerStyle={{ justifyContent: "flex-start", paddingTop: 24 }}
            />
          }
          renderItem={({ item: profile }) => (
            <SearchedProfilePreview
              profile={profile}
              showFollowButtons={false}
              key={profile.id}
              onPress={() => {
                handleProfileSelection(profile);
              }}
            />
          )}
          ListFooterComponent={
            <LoadingRetryFooter
              isLoading={profileSearch.isFetchingNextPage}
              isError={profileSearch.isFetchNextPageError}
              fetchNextPage={profileSearch.fetchNextPage}
              message="Oh no! There was an error fetching more profiles!"
            />
          }
        />
      </View>
    </Modal>
  );
};

export default ProfileSearchModal;
