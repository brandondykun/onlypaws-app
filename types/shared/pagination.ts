// Paginated response for posts - can work for any request fetching posts
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
