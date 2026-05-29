---
name: list-screens
description: Build OnlyPaws mobile list screens with FlashList, infinite scroll, pull-to-refresh, empty/error/loading states, tab-bar padding, search headers, grids, post feeds, and ads. Use when adding or modifying list screens, paginated lists, ListEmptyComponent, LoadingRetryFooter, PostScrollList, or BottomSheetFlatList lists in the Expo app.
---

# List Screens

## Default List Shape

Use `FlashList` for screen-level lists. Combine this skill with `data-fetching` for `useInfiniteQuery` setup.

Typical imports:

```tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl } from "react-native";

import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import { COLORS } from "@/constants/Colors";
```

Use `useBottomTabBarHeight()` for tabbed screens and pass padding through `contentContainerStyle`:

```tsx
const tabBarHeight = useBottomTabBarHeight();

<FlashList
  data={dataToRender}
  contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight }}
  showsVerticalScrollIndicator={false}
/>
```

Add top or horizontal padding only when the screen design needs it, such as settings/report lists.

## Infinite Scroll

Guard end-reached fetches so FlashList does not duplicate requests:

```tsx
const handleEndReached = () => {
  const hasErrors = query.isError || query.isFetchNextPageError;
  const isLoading = query.isLoading || query.isFetchingNextPage;

  if (query.hasNextPage && !hasErrors && !isLoading) {
    query.fetchNextPage();
  }
};
```

Wire the list consistently:

```tsx
<FlashList
  data={dataToRender}
  keyExtractor={(item) => item.id.toString()}
  onEndReachedThreshold={0.3}
  onEndReached={handleEndReached}
  ListFooterComponent={
    <LoadingRetryFooter
      isLoading={query.isFetchingNextPage}
      isError={query.isFetchNextPageError}
      fetchNextPage={query.fetchNextPage}
      message="Oh no! There was an error fetching more items!"
    />
  }
/>
```

Use `LoadingRetryFooterWithEnd` only when the screen intentionally needs an end-of-list message. Most app lists use `LoadingRetryFooter`.

## Pull To Refresh

For regular lists, use `RefreshControl`:

```tsx
<FlashList
  refreshing={query.isRefetching}
  refreshControl={
    <RefreshControl
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      tintColor={COLORS.zinc[400]}
      colors={[COLORS.zinc[400]]}
    />
  }
/>
```

When a list can fetch the next page while refreshing, avoid showing both states as refresh:

```tsx
refreshing={query.isRefetching && !query.isFetchingNextPage}
```

Search-mode lists often disable pull-to-refresh while search is active.

## Empty, Loading, And Error States

Prefer `ListEmptyComponent` for empty/loading/error states:

```tsx
<ListEmptyComponent
  isLoading={!query.data || query.isLoading}
  isError={query.isError}
  isRefetching={query.isRefetching}
  loadingComponent={<PostTileSkeleton />}
  emptyMessage="No items found."
  errorMessage="There was an error fetching items."
  errorSubMessage="Swipe down to try again."
/>
```

Use `customEmptyComponent` or `customErrorComponent` when a list needs custom layout or actions. Do not pass both custom and message props for the same state.

For full-screen initial failures outside a list, `ErrorMessageWithRefresh` is acceptable, especially on simple settings/report screens.

## Search Lists

For searchable lists, keep raw input and submitted search separate:

```tsx
const [searchText, setSearchTextState] = useState("");
const [submittedSearchText, setSubmittedSearchText] = useState("");

const isSearchActive = !!submittedSearchText;
const activeQuery = isSearchActive ? searchQuery : mainQuery;
const dataToRender = isSearchActive ? searchResults : mainResults;
```

Use `HeaderSearchInput` in `ListHeaderComponent`, `SearchListHeader` for the current mode label, and `enabled: !!submittedSearchText` on the search query. Clear `submittedSearchText` when the input becomes empty.

## Common List Variants

- Grid lists: use `numColumns={3}`, `PostTile`, `PostTileSkeleton`, and a tiny `ItemSeparatorComponent`.
- Post feeds: render `Post`, use `PostScrollList` for scrollable post detail lists with optional `initialScrollIndex`.
- Lists with ads: use `useAdsInList({ items, renderItem })` and pass its `data`, `renderItem`, and `keyExtractor` to `FlashList`.
- Bottom-sheet lists: use `BottomSheetFlatList` but keep the same `keyExtractor`, `onEndReached`, `ListEmptyComponent`, `RefreshControl`, and `LoadingRetryFooter` patterns.

## Checklist

- Use `FlashList` for screen lists and `BottomSheetFlatList` inside bottom sheets.
- Flatten infinite data with `pages.flatMap((page) => page.results)`.
- Use stable string keys, usually `item.id.toString()`.
- Include `showsVerticalScrollIndicator={false}` unless the screen intentionally needs it.
- Set `contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight }}` for tabbed screens.
- Guard `fetchNextPage` with `hasNextPage`, loading flags, and error flags.
- Use `LoadingRetryFooter` for pagination footer loading/retry.
- Use `ListEmptyComponent` for loading, error, refreshing, and empty states.
- Use screen-specific, user-friendly empty/error messages.
- Keep navigation from list items in `handle*` callbacks or inline only when trivial.
