import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import {
  useWindowDimensions,
  View,
  Pressable,
  ScrollView,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { toastConfig } from "@/config/ToastConfig";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { SearchedProfile } from "@/types";
import { PostImage } from "@/types";
import { ImageAssetWithTags } from "@/types/post/post";

import Button from "../Button/Button";
import ImageSwiper from "../ImageSwiper/ImageSwiper";
import Modal from "../Modal/Modal";
import PostImageWithTags from "../PostImageWithTags/PostImageWithTags";
import ProfileSearchModal from "../ProfileSearchModal/ProfileSearchModal";
import SearchedProfilePreview from "../SearchedProfilePreview/SearchedProfilePreview";
import Text from "../Text/Text";

type Props = {
  images: ImageAssetWithTags[] | PostImage[];
  addTag: (imageId: string, profile: SearchedProfile, xPosition: number, yPosition: number) => void;
  removeTag: (tagId: string) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  addTagLoading?: boolean;
  removeTagLoading?: boolean;
};

const TagImagesModal = ({
  images,
  addTag,
  removeTag,
  visible,
  setVisible,
  addTagLoading = false,
  removeTagLoading = false,
}: Props) => {
  const { setLightOrDark } = useColorMode();

  const width = useWindowDimensions().width;
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [tappedCoordinates, setTappedCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [showTagPopovers, setShowTagPopovers] = useState(true);

  const isLoading = addTagLoading || removeTagLoading;

  const profilesToDisplay = images[currentIndex]?.tags?.map((tag) => tag.tagged_profile) || [];

  const handleProfileSelection = (profile: SearchedProfile) => {
    const currentImage = images[currentIndex];
    addTag(currentImage.id.toString(), profile, tappedCoordinates?.x || 0, tappedCoordinates?.y || 0);
    setSearchModalVisible(false);
    setTappedCoordinates(null);
  };

  const handleRemoveTag = (profile: SearchedProfile) => {
    const currentImage = images[currentIndex];
    const tagToRemove = currentImage.tags.find((tag) => tag.tagged_profile.id === profile.id);
    if (tagToRemove) {
      removeTag(tagToRemove?.id.toString());
    }
  };

  const handleProfileSelectionCancel = () => {
    setSearchModalVisible(false);
    setTappedCoordinates(null);
  };

  // Handle image press to add a tag coordinate
  const handleCoordinatesPress = (e: GestureResponderEvent) => {
    if (isLoading) return;

    const EDGE_BUFFER = 20;
    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;

    // Check if coordinates are too close to any edge
    if (x < EDGE_BUFFER || x > width - EDGE_BUFFER || y < EDGE_BUFFER || y > width - EDGE_BUFFER) {
      console.log("Tag too close to edge, ignoring");
      return;
    }

    setTappedCoordinates({ x, y });
    setSearchModalVisible(true);
  };

  const loading = addTagLoading || removeTagLoading;

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      animationType="slide"
      withScroll={false}
      backgroundColor={setLightOrDark(COLORS.zinc[100], COLORS.zinc[950])}
    >
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}>
        <View style={{ marginBottom: 12, position: "relative" }}>
          <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600" }}>Tag Images</Text>
          <View style={{ position: "absolute", right: 12, top: 0 }}>
            {!loading ? (
              <Button
                variant="text"
                text="Done"
                onPress={() => setVisible(false)}
                buttonStyle={{ height: "auto" }}
                textStyle={{ color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }}
                disabled={isLoading}
              />
            ) : (
              <ActivityIndicator size="small" color={setLightOrDark(COLORS.sky[600], COLORS.sky[500])} />
            )}
          </View>
        </View>
        <ImageSwiper
          images={images}
          onIndexChange={setCurrentIndex}
          renderItem={({ item }) => (
            <PostImageWithTags
              item={item}
              handleCoordinatesPress={handleCoordinatesPress}
              showTagPopovers={showTagPopovers}
              setShowTagPopovers={setShowTagPopovers}
            />
          )}
        />
        {profilesToDisplay.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{ color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[300]), fontSize: 16, fontWeight: "400" }}
            >
              Tap image to add a tag
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}>
            {profilesToDisplay.map((profile) => (
              <View style={{ gap: 6, flexDirection: "row", alignItems: "center", paddingRight: 24 }} key={profile.id}>
                <View style={{ flex: 1 }}>
                  <SearchedProfilePreview profile={profile} showFollowButtons={false} />
                </View>
                <Pressable
                  onPress={() => handleRemoveTag(profile)}
                  style={({ pressed }) => [pressed && { opacity: 0.5 }, { marginTop: 3, padding: 4 }]}
                  disabled={isLoading}
                >
                  <AntDesign
                    name="close"
                    size={14}
                    color={
                      isLoading
                        ? setLightOrDark(COLORS.zinc[400], COLORS.zinc[600])
                        : setLightOrDark(COLORS.zinc[900], COLORS.zinc[100])
                    }
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <ProfileSearchModal
        visible={searchModalVisible}
        setVisible={setSearchModalVisible}
        handleProfileSelection={handleProfileSelection}
        handleProfileSelectionCancel={handleProfileSelectionCancel}
        excludedProfileIds={profilesToDisplay.map((profile) => profile.id)}
      />
      <Toast config={toastConfig} />
    </Modal>
  );
};

export default TagImagesModal;
