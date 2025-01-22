import { BottomSheetScrollView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { View, StyleSheet } from "react-native";

import BottomSheetModal from "@/components/BottomSheet/BottomSheet";
import Button from "@/components/Button/Button";
import DropdownSelect, { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { PetTypeWithTitle } from "@/types";

type Props = {
  petTypeOptions: DropdownSelectOption[] | null;
  profileName: string;
  setProfileName: React.Dispatch<React.SetStateAction<string>>;
  handleEditModalClose: () => void;
  petType: PetTypeWithTitle | null;
  setPetType: React.Dispatch<React.SetStateAction<PetTypeWithTitle | null>>;
  aboutText: string;
  setAboutText: React.Dispatch<React.SetStateAction<string>>;
  breed: string;
  setBreed: React.Dispatch<React.SetStateAction<string>>;
  editProfileModalRef: React.RefObject<RNBottomSheetModal>;
  handleProfileUpdate: () => Promise<void>;
  updateProfileLoading: boolean;
};

const EditProfileModal = ({
  petTypeOptions,
  profileName,
  setProfileName,
  handleEditModalClose,
  petType,
  setPetType,
  aboutText,
  setAboutText,
  breed,
  setBreed,
  editProfileModalRef,
  handleProfileUpdate,
  updateProfileLoading,
}: Props) => {
  return (
    <BottomSheetModal handleTitle="Edit Profile" ref={editProfileModalRef} onDismiss={handleEditModalClose}>
      <BottomSheetScrollView contentContainerStyle={s.scrollView}>
        <View style={{ flexGrow: 1 }}>
          <View style={{ flexGrow: 1 }}>
            <View>
              <Text>Name</Text>
              <TextInput value={profileName} onChangeText={(val) => setProfileName(val)} placeholder="ex: Charlie" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text>Pet Type</Text>
              <DropdownSelect
                defaultText="Select a pet type"
                defaultValue={petType ? petType : null}
                data={petTypeOptions || []}
                onSelect={(selectedItem) => setPetType(selectedItem)}
              />
            </View>
            <View>
              <Text>Breed</Text>
              <TextInput value={breed} onChangeText={(val) => setBreed(val)} placeholder="ex: Golden Retriever" />
            </View>
            <View>
              <Text>About</Text>
              <TextInput
                defaultValue={aboutText}
                onChangeText={(val) => setAboutText(val)}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={{ marginTop: 36 }}>
            <Button text="Submit" onPress={handleProfileUpdate} loading={updateProfileLoading} />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default EditProfileModal;

const s = StyleSheet.create({
  scrollView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
});
