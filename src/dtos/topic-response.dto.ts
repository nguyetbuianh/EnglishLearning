import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { Vocabulary } from '../entities/vocabulary.entity';
import { PaginationResponseDto } from './pagination.dto';
import { VocabularyResponseDto } from './vocab-response.dto';

export class TopicResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}


export class TopicIdParamDto {
  @IsInt()
  @Type(() => Number)
  topicId: number;
}

export class VocabPaginationResponseDto {
  items: VocabularyResponseDto[];
  pagination: PaginationResponseDto;
}