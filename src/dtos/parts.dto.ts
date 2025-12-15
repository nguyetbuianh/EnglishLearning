import { ApiProperty } from '@nestjs/swagger';

export class PartsDto {
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
