export const queryKeys = {
  /**
   * Query keys for profiles
   */
  profile: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "profile"] as const,

    details: (selectedProfilePublicId: string, profileId: string | number) =>
      [...queryKeys.profile.root(selectedProfilePublicId), profileId.toString()] as const,

    followers: (selectedProfilePublicId: string, profileId: string | number) =>
      [...queryKeys.profile.details(selectedProfilePublicId, profileId.toString()), "followers"] as const,

    following: (selectedProfilePublicId: string, profileId: string | number) =>
      [...queryKeys.profile.details(selectedProfilePublicId, profileId.toString()), "following"] as const,
  },

  /**
   * Query keys for profile search
   */

  profileSearch: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "profileSearch"] as const,

    results: (selectedProfilePublicId: string, searchText: string) =>
      [...queryKeys.profileSearch.root(selectedProfilePublicId), searchText] as const,

    tags: (selectedProfilePublicId: string, searchText: string) =>
      [...queryKeys.profileSearch.root(selectedProfilePublicId), "tags", searchText] as const,
  },

  /**
   * Query keys for posts
   */

  posts: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "posts"] as const,

    details: (selectedProfilePublicId: string, postId: string | number) =>
      [...queryKeys.posts.root(selectedProfilePublicId), "post", postId.toString()] as const,

    feed: (selectedProfilePublicId: string) => [...queryKeys.posts.root(selectedProfilePublicId), "feed"] as const,

    profile: (selectedProfilePublicId: string, profileId: string | number) =>
      [...queryKeys.posts.root(selectedProfilePublicId), "profile", profileId.toString()] as const,

    explore: (selectedProfilePublicId: string) =>
      [...queryKeys.posts.root(selectedProfilePublicId), "explore"] as const,

    similar: (selectedProfilePublicId: string, postId: string | number) =>
      [...queryKeys.posts.root(selectedProfilePublicId), "explore", "similar", postId.toString()] as const,

    saved: (selectedProfilePublicId: string) => [...queryKeys.posts.root(selectedProfilePublicId), "saved"] as const,

    tagged: (selectedProfilePublicId: string, profileId: string | number) =>
      [...queryKeys.posts.root(selectedProfilePublicId), "tagged", profileId.toString()] as const,

    authProfile: (selectedProfilePublicId: string) =>
      [...queryKeys.posts.root(selectedProfilePublicId), "authProfile"] as const,
  },

  /**
   * Query keys for post comments
   */

  comments: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "comments"] as const,

    post: (selectedProfilePublicId: string, postId: string | number) =>
      [...queryKeys.comments.root(selectedProfilePublicId), postId.toString()] as const,
  },

  /**
   * Query keys for comment replies
   */

  commentReplies: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "comment-replies"] as const,

    comment: (selectedProfilePublicId: string, commentId: string | number) =>
      [...queryKeys.commentReplies.root(selectedProfilePublicId), commentId.toString()] as const,
  },

  /**
   * Query keys for follow requests
   */

  followRequests: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "follow-requests"] as const,

    sent: (selectedProfilePublicId: string) =>
      [...queryKeys.followRequests.root(selectedProfilePublicId), "sent"] as const,

    received: (selectedProfilePublicId: string) =>
      [...queryKeys.followRequests.root(selectedProfilePublicId), "received"] as const,
  },

  /**
   * Query keys for notifications
   */

  notifications: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "notifications"] as const,
  },

  /**
   * Query keys for comment chain
   */

  commentChain: {
    root: (selectedProfilePublicId: string, commentId: string | number) =>
      [selectedProfilePublicId, "commentChain", commentId.toString()] as const,
  },

  /**
   * Query keys for followers
   */

  followers: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "followers"] as const,

    search: (selectedProfilePublicId: string, searchText: string) =>
      [...queryKeys.followers.root(selectedProfilePublicId), "search", searchText] as const,
  },

  /**
   * Query keys for following
   */

  following: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "following"] as const,

    search: (selectedProfilePublicId: string, searchText: string) =>
      [...queryKeys.following.root(selectedProfilePublicId), "search", searchText] as const,
  },

  /**
   * Query keys for feedback tickets
   */

  feedbackTicket: {
    root: (selectedProfilePublicId: string) => [selectedProfilePublicId, "feedback-tickets"] as const,

    details: (selectedProfilePublicId: string, ticketId: string | number) =>
      [...queryKeys.feedbackTicket.root(selectedProfilePublicId), ticketId.toString()] as const,
  },

  /**
   * Query keys for queries that are not specific to a selected profile
   */

  announcements: {
    root: (includeWelcome: boolean) => ["announcements", includeWelcome] as const,
  },

  petTypeOptions: {
    root: ["pet-type-options"] as const,
  },

  systemStatus: {
    root: ["system-status"] as const,
  },

  adsConfig: {
    root: ["ads-config"] as const,
  },

  reportReasons: {
    root: ["report-reasons"] as const,
  },
};
