import { InfiniteData } from "@tanstack/react-query";

/**
 * Base shape for paginated/infinite query pages (requires results array, allows additional properties)
 */
export type ResultsPage<T> = {
  results: T[];
};

type ItemWithId = { id: string | number };

/**
 * Safely update a single item by id inside an infinite query
 */
export function updateInfiniteItemById<P extends { results: ItemWithId[] | null }>(
  data: InfiniteData<P> | undefined,
  id: string | number,
  updater: (item: NonNullable<P["results"]>[number]) => NonNullable<P["results"]>[number],
): InfiniteData<P> | undefined {
  if (!data?.pages) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: page.results?.map((item) => (String(item.id) === String(id) ? updater(item) : item)) ?? null,
    })),
  } as InfiniteData<P>;
}

/**
 * Remove an item by id from an infinite query
 */
export function removeInfiniteItemById<P extends { results: ItemWithId[] | null }>(
  data: InfiniteData<P> | undefined,
  id: string | number,
): InfiniteData<P> | undefined {
  if (!data?.pages) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: page.results?.filter((item) => String(item.id) !== String(id)) ?? null,
    })),
  } as InfiniteData<P>;
}

/**
 * Update all items in an infinite query with an updater function
 */
export function updateAllInfiniteItems<P extends { results: unknown[] | null }>(
  data: InfiniteData<P> | undefined,
  updater: (item: NonNullable<P["results"]>[number]) => NonNullable<P["results"]>[number],
): InfiniteData<P> | undefined {
  if (!data?.pages) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: page.results?.map((item) => updater(item)) ?? null,
    })),
  } as InfiniteData<P>;
}

/**
 * Insert or replace an item in an infinite query
 * (useful for optimistic adds or upserts)
 */
export function upsertInfiniteItem<P extends { results: ItemWithId[] | null }>(
  data: InfiniteData<P> | undefined,
  item: NonNullable<P["results"]>[number],
): InfiniteData<P> | undefined {
  if (!data?.pages) return data;

  let found = false;

  const pages = data.pages.map((page) => {
    const results =
      page.results?.map((existing) => {
        if (String(existing.id) === String(item.id)) {
          found = true;
          return item;
        }
        return existing;
      }) ?? null;

    return { ...page, results };
  });

  if (found) {
    return { ...data, pages } as InfiniteData<P>;
  }

  // If not found, prepend to first page
  const firstPageResults = pages[0].results;
  return {
    ...data,
    pages: [
      {
        ...pages[0],
        results: firstPageResults ? [item, ...firstPageResults] : [item],
      },
      ...pages.slice(1),
    ],
  } as InfiniteData<P>;
}
