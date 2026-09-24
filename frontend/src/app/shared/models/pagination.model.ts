export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationQueryParams {
  page?: number;
  page_size?: number;
  hours?: number;
  days?: number;
  ordering?: string;
}
