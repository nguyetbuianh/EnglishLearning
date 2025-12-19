import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginationResponse<T> {
  data: T[];
  pagination?: PaginationMeta
}

export class SimpleResponse<T> {
  data: T
}