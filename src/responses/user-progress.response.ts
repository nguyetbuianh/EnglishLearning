import { ApiProperty } from '@nestjs/swagger';
import { Parts } from '../interfaces/parts.interface';
import { PartsResponse } from '../responses/parts.response';
import { ToeicTestResponse } from '../responses/toeic-test.response';
import { PaginationResponse } from '../responses/pagination.response';

export class UserProgressByTestResponse {
  @ApiProperty()
  testId: number;

  @ApiProperty({ type: () => [PartsResponse] })
  parts: Parts[];
}

export class TestWithProgressResponse extends ToeicTestResponse {
  partsProcess: number | null;
}

export class TestPaginationResponseResponse {
  items: TestWithProgressResponse[];
  pagination: PaginationResponse;
}