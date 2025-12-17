import { ApiProperty } from '@nestjs/swagger';

export class PartsResponse {
  @ApiProperty()
  partNumber: number;

  @ApiProperty()
  correctCount: number;

  @ApiProperty()
  attemptedCount: number;

  @ApiProperty()
  totalInPart: number;

  @ApiProperty()
  percent: number;
}
