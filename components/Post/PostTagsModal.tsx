import { BottomSheetModal as RNBottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchedProfile } from "@/types";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import SearchedProfilePreview from "../SearchedProfilePreview/SearchedProfilePreview";

type Props = {
  taggedProfiles: SearchedProfile[];
  onProfilePress?: ((profileId: string) => void) | undefined;
};

const PostTagsModal = forwardRef(({ taggedProfiles, onProfilePress }: Props, ref: ForwardedRef<RNBottomSheetModal>) => {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal handleTitle="Tagged Profiles" ref={ref} enableDynamicSizing={true} snapPoints={[]}>
      <BottomSheetView>
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom }}>
          {taggedProfiles.map((profile) => (
            <SearchedProfilePreview
              key={profile.id}
              profile={profile}
              onPress={onProfilePress}
              showFollowButtons={false}
            />
          ))}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

PostTagsModal.displayName = "PostTagsModal";
export default PostTagsModal;
