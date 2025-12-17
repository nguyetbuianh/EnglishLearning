import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { TopicService } from "../modules/topic-vocabulary/topic.service";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { TopicIdParamDto, TopicResponseDto, VocabPaginationResponseDto } from "../dtos/topic-response.dto";
import { VocabularyService } from "../modules/vocabulary/vocabulary.service";
import { PaginationDto } from "../dtos/pagination.dto";
import { plainToInstance } from "class-transformer";
import { VocabularyResponseDto } from "../dtos/vocab-response.dto";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topicService: TopicService,
    private readonly vocabService: VocabularyService
  ) { }

  // GET /topics
  @Get()
  @ApiOkResponse({ type: TopicResponseDto })
  async findAllTopics(): Promise<TopicResponseDto[]> {
    const topic = await this.topicService.getAllTopics();
    return topic;
  }

  //GET /:topicId/vocab
  @Get('/:topicId/vocab')
  @ApiOkResponse({ type: VocabPaginationResponseDto })
  async findVocabsOfTopic(
    @Param() topicParams: TopicIdParamDto,
    @Query() paginationQuery: PaginationDto
  ): Promise<VocabPaginationResponseDto> {
    const topicId = topicParams.topicId;
    const { page, limit } = paginationQuery;
    const { items, pagination } = await this.vocabService.getVocabulariesByTopic(topicId, page, limit);

    return {
      items: plainToInstance(VocabularyResponseDto, items, {
        excludeExtraneousValues: true,
      }),
      pagination,
    };
  }

}
