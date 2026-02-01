export const queryKeys = {
  /**
   * Query keys for profiles
   */
  profile: {
    root: (selectedProfileId: number) => [selectedProfileId, "profile"] as const,

    details: (selectedProfileId: number, profileId: string | number) =>
      [...queryKeys.profile.root(selectedProfileId), profileId.toString()] as const,

    followers: (selectedProfileId: number, profileId: string | number) =>
      [...queryKeys.profile.details(selectedProfileId, profileId.toString()), "followers"] as const,

    following: (selectedProfileId: number, profileId: string | number) =>
      [...queryKeys.profile.details(selectedProfileId, profileId.toString()), "following"] as const,
  },

  /**
   * Query keys for profile search
   */

  profileSearch: {
    root: (selectedProfileId: number) => [selectedProfileId, "profileSearch"] as const,

    results: (selectedProfileId: number, searchText: string) =>
      [...queryKeys.profileSearch.root(selectedProfileId), searchText] as const,

    tags: (selectedProfileId: number, searchText: string) =>
      [...queryKeys.profileSearch.root(selectedProfileId), "tags", searchText] as const,
  },

  /**
   * Query keys for posts
   */

  posts: {
    root: (selectedProfileId: number) => [selectedProfileId, "posts"] as const,

    details: (selectedProfileId: number, postId: string | number) =>
      [...queryKeys.posts.root(selectedProfileId), "post", postId.toString()] as const,

    feed: (selectedProfileId: number) => [...queryKeys.posts.root(selectedProfileId), "feed"] as const,

    profile: (selectedProfileId: number, profileId: string | number) =>
      [...queryKeys.posts.root(selectedProfileId), "profile", profileId.toString()] as const,

    explore: (selectedProfileId: number) => [...queryKeys.posts.root(selectedProfileId), "explore"] as const,

    similar: (selectedProfileId: number, postId: string | number) =>
      [...queryKeys.posts.root(selectedProfileId), "explore", "similar", postId.toString()] as const,

    saved: (selectedProfileId: number) => [...queryKeys.posts.root(selectedProfileId), "saved"] as const,

    tagged: (selectedProfileId: number, profileId: string | number) =>
      [...queryKeys.posts.root(selectedProfileId), "tagged", profileId.toString()] as const,

    authProfile: (selectedProfileId: number) => [...queryKeys.posts.root(selectedProfileId), "authProfile"] as const,
  },

  /**
   * Query keys for post comments
   */

  comments: {
    root: (selectedProfileId: number) => [selectedProfileId, "comments"] as const,

    post: (selectedProfileId: number, postId: string | number) =>
      [...queryKeys.comments.root(selectedProfileId), postId.toString()] as const,
  },

  /**
   * Query keys for comment replies
   */

  commentReplies: {
    root: (selectedProfileId: number) => [selectedProfileId, "comment-replies"] as const,

    comment: (selectedProfileId: number, commentId: string | number) =>
      [...queryKeys.commentReplies.root(selectedProfileId), commentId.toString()] as const,
  },

  /**
   * Query keys for follow requests
   */

  followRequests: {
    root: (selectedProfileId: number) => [selectedProfileId, "follow-requests"] as const,

    sent: (selectedProfileId: number) => [...queryKeys.followRequests.root(selectedProfileId), "sent"] as const,

    received: (selectedProfileId: number) => [...queryKeys.followRequests.root(selectedProfileId), "received"] as const,
  },

  /**
   * Query keys for notifications
   */

  notifications: {
    root: (selectedProfileId: number) => [selectedProfileId, "notifications"] as const,
  },

  /**
   * Query keys for comment chain
   */

  commentChain: {
    root: (selectedProfileId: number, commentId: string | number) =>
      [selectedProfileId, "commentChain", commentId.toString()] as const,
  },

  /**
   * Query keys for followers
   */

  followers: {
    root: (selectedProfileId: number) => [selectedProfileId, "followers"] as const,

    search: (selectedProfileId: number, searchText: string) =>
      [...queryKeys.followers.root(selectedProfileId), "search", searchText] as const,
  },

  /**
   * Query keys for following
   */

  following: {
    root: (selectedProfileId: number) => [selectedProfileId, "following"] as const,

    search: (selectedProfileId: number, searchText: string) =>
      [...queryKeys.following.root(selectedProfileId), "search", searchText] as const,
  },

  /**
   * Query keys for feedback tickets
   */

  feedbackTicket: {
    root: (selectedProfileId: number) => [selectedProfileId, "feedback-tickets"] as const,

    details: (selectedProfileId: number, ticketId: string | number) =>
      [...queryKeys.feedbackTicket.root(selectedProfileId), ticketId.toString()] as const,
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
