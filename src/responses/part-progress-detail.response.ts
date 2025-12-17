import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ToeicTestResponse } from './toeic-test.response';

export class PartProgressDetailResponse {
  @ApiProperty()
  @Expose()
  partId: number;

  @ApiProperty()
  @Expose()
  partNumber: number;

  @ApiProperty()
  @Expose()
  partTitle: string;

  @ApiProperty()
  @Expose()
  isCompleted: boolean;
}

export class ProgressDetailResponse {
  @ApiProperty()
  @Expose()
  test: ToeicTestResponse;

  @ApiProperty()
  @Expose()
  parts: PartProgressDetailResponse[];
}