// Paginated response for posts - can work for any request fetching posts.
// `count` is omitted by cursor-paginated endpoints (e.g. /v1/post/explore/),
// and those endpoints add a `source` field describing which path produced the
// results ("long+short" | "long_only" | "short_only" | "popularity" | null).
export type PaginatedResponse<T> = {
  count?: number;
  next: string | null;
  previous: string | null;
  results: T[];
  source?: string | null;
};
