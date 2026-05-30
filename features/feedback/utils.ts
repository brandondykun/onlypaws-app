import { FeedbackTicketType } from "./types";

// Convert readable string feed back type to the type string needed for the API
export const getFeedbackType = (type: string): FeedbackTicketType => {
  if (type.toLowerCase() === "bug") return "bug";
  if (type.toLowerCase() === "feature request") return "feature";
  if (type.toLowerCase() === "general feedback") return "general";
  return "general";
};

// Convert the type string needed for the API to a readable string
export const getReadableFeedbackType = (type: FeedbackTicketType): string => {
  if (type === "bug") return "Bug Report";
  if (type === "feature") return "Feature Request";
  if (type === "general") return "General Feedback";
  return "General Feedback";
};
