
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class TestPartParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  testId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  partId: number;
}

export class TestParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  testId: number;
}

export class ContinueProgressDto {
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isContinue: boolean;
}