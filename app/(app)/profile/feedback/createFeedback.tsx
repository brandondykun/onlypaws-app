import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { createFeedbackTicket } from "@/api/feedback";
import Button from "@/components/Button/Button";
import DropdownSelect, { DropdownSelectOption } from "@/components/DropdownSelect/DropdownSelect";
import TextInput from "@/components/TextInput/TextInput";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { FeedbackTicket } from "@/types/feedback/feedback";
import { PaginatedResponse } from "@/types/shared/pagination";
import { getFeedbackType } from "@/utils/utils";

const FEEDBACK_TYPE_OPTIONS: DropdownSelectOption[] = [
  { id: 1, title: "Bug" },
  { id: 2, title: "Feature Request" },
  { id: 3, title: "General Feedback" },
];

const CreateFeedbackScreen = () => {
  const { selectedProfileId } = useAuthUserContext();

  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [feedbackType, setFeedbackType] = useState<{ id: number; title: string } | null>(null);
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    let hasErrors = false;
    setTitleError("");
    setDescriptionError("");

    if (!feedbackType) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Feedback type is required.",
      });
      return;
    }

    if (title.length === 0) {
      setTitleError("Title is required.");
      hasErrors = true;
    }

    if (description.length === 0) {
      setDescriptionError("Description is required.");
      hasErrors = true;
    }

    if (hasErrors) return;

    setSubmitLoading(true);

    const { data, error } = await createFeedbackTicket({
      title,
      description,
      ticket_type: getFeedbackType(feedbackType ? feedbackType?.title : ""),
      app_version: Application.nativeApplicationVersion ?? undefined,
      device_info: {
        device_model: Device.modelName ?? undefined,
        manufacturer: Device.manufacturer ?? undefined,
        os_name: Device.osName ?? undefined,
        os_version: Device.osVersion ?? undefined,
      },
    });

    if (data && !error) {
      // Update the feedback tickets query data to include the new feedback ticket
      queryClient.setQueryData<InfiniteData<PaginatedResponse<FeedbackTicket>>>(
        [selectedProfileId, "feedback-tickets"],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const firstPage = oldData.pages[0];
          const updatedFirstPage = {
            ...firstPage,
            count: firstPage?.count + 1,
            results: [data, ...(firstPage?.results || [])],
          };

          // Handle infinite query structure
          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          };
        },
      );

      // Navigate back to the feedback screen
      router.back();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your feedback ticket has been created! Thank you for your feedback.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error creating your feedback ticket. Please try again.",
      });
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[s.scrollView, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
    >
      <View style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, paddingTop: 12, gap: 12 }}>
          <View style={{ marginBottom: 14 }}>
            <DropdownSelect
              label="Feedback Type"
              defaultText="Select a feedback type"
              defaultValue={feedbackType ? feedbackType : null}
              data={FEEDBACK_TYPE_OPTIONS}
              onSelect={(selectedItem) => setFeedbackType(selectedItem)}
            />
          </View>
          <View>
            <TextInput
              label="Title"
              value={title}
              onChangeText={(val) => setTitle(val)}
              placeholder="Enter a brief title"
              error={titleError}
              maxLength={200}
            />
          </View>
          <View>
            <TextInput
              label="Description"
              value={description}
              onChangeText={(val) => setDescription(val)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
              showCharCount
              error={descriptionError}
              placeholder="Describe the issue or suggestion in detail"
            />
          </View>
        </View>
        <View style={{ marginTop: 36 }}>
          <Button text="Submit" onPress={handleSubmit} loading={submitLoading} />
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateFeedbackScreen;

const s = StyleSheet.create({
  scrollView: {
    paddingBottom: 48,
    paddingTop: 16,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
});
