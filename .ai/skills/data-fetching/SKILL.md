---
name: data-fetching
description: Explain and implement OnlyPaws mobile data fetching patterns with React Query. Use when adding useQuery requests, useInfiniteQuery infinite scroll lists, paginated API calls, query keys, pull-to-refresh, list footer retry states, or loading/error/empty states in the Expo app.
---

# Data Fetching

## Core Pattern

Use React Query for server state. Prefer the shared `queryKeys` helpers from `@/utils/query/queryKeys` instead of inline query key arrays, and include `selectedProfileId` for profile-scoped data so cache entries reset when the active profile changes.

For one-shot detail screens, use `useQuery`:

```tsx
const fetchCommentChain = async (commentId: string) => {
  const res = await getCommentChainForQuery(commentId);
  return res.data;
};

const {
  data: commentChain,
  isLoading,
  isError,
  refetch,
} = useQuery({
  queryKey: queryKeys.commentChain.root(selectedProfileId, commentId),
  queryFn: () => fetchCommentChain(commentId),
  enabled: !!commentId,
});
```

Use `enabled` when required params can be missing on the first render.

## Infinite Scroll Queries

Use `useInfiniteQuery` for paginated lists backed by `PaginatedResponse<T>` responses with `next`, `previous`, and `results`.

Expected imports:

```tsx
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { RefreshControl } from "react-native";

import LoadingRetryFooter from "@/shared/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import { COLORS } from "@/constants/Colors";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";
```

Create a small fetch function that accepts React Query's `pageParam`, calls the `ForQuery` API helper, and returns `res.data`:

```tsx
const fetchItems = async ({ pageParam }: { pageParam: string }) => {
  const res = await getItemsForQuery(pageParam);
  return res.data;
};

const itemsQuery = useInfiniteQuery({
  queryKey: queryKeys.items.root(selectedProfileId),
  queryFn: fetchItems,
  initialPageParam: "1",
  getNextPageParam: (lastPage) => getNextPageParam(lastPage),
});
```

API helpers for infinite queries should accept `number | string` and pass it as the `page` query param:

```tsx
export const getItemsForQuery = async (pageParam: number | string) => {
  const url = `/v1/items/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<Item>>(url);
};
```

Use the shared `getNextPageParam(lastPage)` helper unless the endpoint uses a different pagination contract. It extracts the next page from `lastPage.next`.

## Rendering Infinite Data

Flatten pages with `useMemo` before passing data to `FlashList`:

```tsx
const dataToRender = useMemo(() => {
  return itemsQuery.data?.pages.flatMap((page) => page.results) ?? [];
}, [itemsQuery.data]);
```

Guard `fetchNextPage()` so the list does not duplicate requests or keep requesting after an error:

```tsx
const handleEndReached = () => {
  const hasErrors = itemsQuery.isError || itemsQuery.isFetchNextPageError;
  const isLoading = itemsQuery.isLoading || itemsQuery.isFetchingNextPage;

  if (itemsQuery.hasNextPage && !hasErrors && !isLoading) {
    itemsQuery.fetchNextPage();
  }
};
```

Wire list state consistently:

```tsx
<FlashList
  data={dataToRender}
  refreshing={itemsQuery.isRefetching}
  refreshControl={
    <RefreshControl
      refreshing={itemsQuery.isRefetching}
      onRefresh={itemsQuery.refetch}
      tintColor={COLORS.zinc[400]}
      colors={[COLORS.zinc[400]]}
    />
  }
  onEndReachedThreshold={0.3}
  onEndReached={handleEndReached}
  ListFooterComponent={
    <LoadingRetryFooter
      isLoading={itemsQuery.isFetchingNextPage}
      isError={itemsQuery.isFetchNextPageError}
      fetchNextPage={itemsQuery.fetchNextPage}
      message="Oh no! There was an error fetching more items!"
    />
  }
  ListEmptyComponent={
    <ListEmptyComponent
      isLoading={!itemsQuery.data || itemsQuery.isLoading || itemsQuery.isFetching}
      isError={itemsQuery.isError}
      isRefetching={itemsQuery.isRefetching}
      emptyMessage="No items found."
      errorMessage="There was an error fetching items."
      errorSubMessage="Swipe down to try again."
    />
  }
/>
```

`LoadingRetryFooter` is the common default for infinite lists. Use `LoadingRetryFooterWithEnd` only when the screen intentionally shows an end-of-list message after all pages have loaded.

## Checklist

- Add or reuse an API helper named like `getThingForQuery(pageParam)`.
- Add a `queryKeys` helper for the resource instead of using inline arrays.
- Use `initialPageParam: "1"` for page-number pagination.
- Return `res.data` from the query function, not the Axios response.
- Flatten `data.pages.flatMap((page) => page.results)` for list rendering.
- Use `LoadingRetryFooter` with `isFetchingNextPage`, `isFetchNextPageError`, `fetchNextPage`, and a screen-specific error `message`.
- Use `isRefetching` and `refetch` for pull-to-refresh.
- Include `enabled` when params such as `postId`, `commentId`, or `profileId` may be undefined.
