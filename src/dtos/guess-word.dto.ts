import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class GuessWordDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vocabId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wordGuessed: string;
}
