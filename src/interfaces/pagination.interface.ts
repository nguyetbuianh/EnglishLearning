export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
