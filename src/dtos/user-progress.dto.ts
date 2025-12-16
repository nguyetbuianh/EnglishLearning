import { ApiProperty } from '@nestjs/swagger';
import { Parts } from '../interfaces/parts.interface';
import { PartsDto } from './parts.dto';
import { ToeicTestDto } from './toeic-test.dto';
import { PaginationResponseDto } from './pagination.dto';

export class UserProgressByTestDto {
  @ApiProperty()
  testId: number;

  @ApiProperty({ type: () => [PartsDto] })
  parts: Parts[];
}

export class TestWithProgressDto extends ToeicTestDto {
  partsProcess: number | null;
}

export class TestPaginationResponseDto {
  items: TestWithProgressDto[];
  pagination: PaginationResponseDto;
}