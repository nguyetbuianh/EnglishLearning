import { PaginationResponse } from "./pagination.response";

export class DataResponse<T> {
  data: T | T[];
  pagination?: PaginationResponse
}