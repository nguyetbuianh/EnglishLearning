import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PartProgressDetailDto {
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
