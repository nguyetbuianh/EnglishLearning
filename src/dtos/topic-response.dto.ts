import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class TopicIdParamDto {
  @IsInt()
  @Type(() => Number)
  topicId: number;
}

