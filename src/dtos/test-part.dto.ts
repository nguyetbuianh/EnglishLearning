
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, Min } from 'class-validator';

export class TestPartParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  testId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  partId?: number;
}

export class ContinueProgressDto {
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isContinue: boolean;
}