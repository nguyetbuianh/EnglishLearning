import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { OptionEnum } from '../enum/option.enum';
export class UserAnswersDto {
  @IsNotEmpty()
  @IsString()
  chosenOption: OptionEnum;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  questionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  passageId?: number;
}

export class TopicTestParamsDto {
  @Type(() => Number)
  @IsInt()
  topicId: number;
}

export class TopicTestAnswersDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  answer: string;
}