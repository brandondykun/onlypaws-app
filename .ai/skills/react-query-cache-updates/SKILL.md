---
name: react-query-cache-updates
description: Implement OnlyPaws React Query cache updates after mutations. Use when adding likes, saves, comments, follows, profile changes, deletes, reports, websocket updates, optimistic updates, query invalidation, refetching, setQueryData, or setQueriesData in the Expo app.
---

# React Query Cache Updates

## Default Decision

Prefer precise cache updates when the mutation changes fields already present in loaded data. Use `refetchQueries` or `invalidateQueries` when server-side membership, permissions, ordering, or derived data is hard to update locally.

Common choices:

- Use `setQueryData` for one known query key, such as profile details or a specific comments list.
- Use `setQueriesData` for all loaded variants under a query-key root, such as every posts list for the selected profile.
- Use `refetchQueries` after relationship changes that affect feeds, private profile visibility, or server-ranked results.
- Use `invalidateQueries` after mutations where freshness matters more than immediate local shaping, such as blocked profiles.
- Use local state alongside query cache for ephemeral websocket data that may not exist in the database response yet.

Always scope profile-specific updates with `selectedProfileId`.

## Query Client Setup

Use the shared query key helpers and typed query data:

```tsx
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

import { PostsDetailedPage } from "@/types";
import { updateInfiniteItemById } from "@/utils/query/cacheUtils";
import { queryKeys } from "@/utils/query/queryKeys";
```

For context-wide managers, get the selected profile from `useAuthProfileContext()` and create one function per user-visible action.

## Infinite Query Helpers

Use `@/utils/query/cacheUtils` for paginated `useInfiniteQuery` data:

- `updateInfiniteItemById(oldData, id, updater)` for items with `id`.
- `updateInfiniteItemByPublicId(oldData, publicId, updater)` for profile/post public IDs.
- `removeInfiniteItemById(oldData, id)` and `removeInfiniteItemByPublicId(oldData, publicId)` for deletes/removals.
- `updateAllInfiniteItems(oldData, updater)` for broad updates like marking every notification read.
- `upsertInfiniteItem(oldData, item)` for optimistic inserts or saved-post additions.

Do not mutate cached objects in place. Always return copied pages/items.

## Updating One Query

Use `setQueryData` when the affected list or detail query key is known:

```tsx
queryClient.setQueryData<InfiniteData<CommentsPage>>(commentsQueryKey, (oldData) => {
  return updateInfiniteItemById(oldData, commentId, (comment) => ({
    ...comment,
    liked: true,
    likes_count: comment.likes_count + 1,
  }));
});
```

For non-infinite detail data, guard missing cache and return the previous value unchanged:

```tsx
queryClient.setQueryData(queryKeys.profile.details(selectedProfileId, profileId), (oldData: ProfileDetails | undefined) => {
  if (!oldData) return oldData;
  return { ...oldData, is_following: true, followers_count: oldData.followers_count + 1 };
});
```

## Updating Many Queries

Use `setQueriesData` when the same entity appears in multiple loaded lists:

```tsx
queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
  { queryKey: queryKeys.posts.root(selectedProfileId) },
  (oldData) =>
    updateInfiniteItemById(oldData, postId, (post) => ({
      ...post,
      liked: true,
      likes_count: post.likes_count + 1,
    })),
);
```

Use a `predicate` when a list needs different behavior. Saved posts are the main example: update every posts query except `saved`, then update the saved cache separately.

```tsx
queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
  {
    queryKey: queryKeys.posts.root(selectedProfileId),
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === selectedProfileId && key[1] === "posts" && !key.includes("saved");
    },
  },
  (oldData) => updateInfiniteItemByPublicId(oldData, postPublicId, (post) => ({ ...post, is_saved: true })),
);
```

## Optimistic Updates

For user-facing relationship actions, apply the local change before the API call and revert on failure:

```tsx
const followProfile = async (profileId: string, isPrivate: boolean) => {
  applyFollowOptimistic(profileId, isPrivate);

  const { error } = await followProfileApi(profileId);

  if (error) {
    revertFollow(profileId, isPrivate);
    toast.error("There was an error following that account.");
    return;
  }

  queryClient.refetchQueries({ queryKey: queryKeys.followRequests.sent(selectedProfileId) });
  if (!isPrivate) {
    queryClient.refetchQueries({ queryKey: queryKeys.posts.feed(selectedProfileId) });
  }
};
```

Keep optimistic helpers paired with matching revert helpers when counts or relationship flags can be wrong after a failed request.

## Centralized Managers

Use existing managers instead of duplicating cache update logic in screens:

- `PostManagerContext` for app-wide post actions: like, unlike, comment count, save, unsave, hide, report.
- `PostsContext` for the authenticated profile's own posts: add, delete, update, remove image, comment count.
- `ProfileDetailsManagerContext` for follow, unfollow, cancel follow request, accepted request, remove follower, block, unblock.
- `useCommentsCacheUpdaters` for comment and reply list updates in the comments modal.
- `NotificationsContext` for notification websocket merge, unread counts, mark read, mark all read.

When adding a new mutation, first look for a manager whose responsibility already matches the entity. Add the cache update there when multiple screens need the behavior.

## Refetch And Invalidate

Use `refetchQueries` when the user should see fresh data immediately and the query is likely mounted or important:

```tsx
queryClient.refetchQueries({ queryKey: queryKeys.posts.feed(selectedProfileId) });
queryClient.refetchQueries({ queryKey: queryKeys.profile.details(selectedProfileId, profileId) });
```

Use `invalidateQueries` when the next consumer should fetch fresh data but immediate shaping is not needed:

```tsx
queryClient.invalidateQueries({ queryKey: queryKeys.blockedProfiles.root(selectedProfileId) });
```

Use `removeQueries` for profile switches or auth-bound data that must not leak between selected profiles.

## Checklist

- Identify every screen/list/detail cache where the entity can appear.
- Use `queryKeys` helpers; do not create inline query key arrays.
- Choose `setQueryData` for one cache, `setQueriesData` for a query-key family, and refetch/invalidate for server-derived membership.
- Import and use `cacheUtils` helpers for infinite-query `pages[].results`.
- Preserve immutability and return `oldData` unchanged when cache is missing.
- Update related local context state when data is stored outside React Query, such as selected explore post, auth profile counts, websocket buffers, or unread counts.
- Add revert logic for optimistic updates that call an API and can fail.
- Keep updates scoped to `selectedProfileId` so data does not cross active profiles.
