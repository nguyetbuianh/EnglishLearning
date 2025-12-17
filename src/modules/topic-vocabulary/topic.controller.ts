import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { TopicService } from "./topic.service";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { TopicIdParamDto } from "../../dtos/topic-response.dto";
import { VocabularyService } from "../vocabulary/vocabulary.service";
import { PaginationDto } from "../../dtos/pagination.dto";
import { plainToInstance } from "class-transformer";
import { VocabularyResponse } from "../../responses/vocab.response.";
import { TopicResponse } from "../../responses/topic-response";
import { DataResponse } from "../../responses/data.response";


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('topics')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly vocabService: VocabularyService
  ) { }

  // GET /topics
  @Get()
  @ApiOkResponse({ type: DataResponse<TopicResponse> })
  async findAllTopics(): Promise<DataResponse<TopicResponse[]>> {
    const topic = await this.topicService.getAllTopics();
    return {
      data: topic
    };
  }

  //GET /:topicId/vocab
  @Get('/:topicId/vocab')
  @ApiOkResponse({
    type: DataResponse<VocabularyResponse>,
    isArray: true
  })
  async findVocabsOfTopic(
    @Param() topicParams: TopicIdParamDto,
    @Query() paginationQuery: PaginationDto
  ): Promise<DataResponse<VocabularyResponse[]>> {
    const topicId = topicParams.topicId;
    const { page, limit } = paginationQuery;
    const { items, pagination } = await this.vocabService.getVocabulariesByTopic(topicId, page, limit);

    const vocabTransform = plainToInstance(VocabularyResponse, items, {
      excludeExtraneousValues: true,
    });

    return {
      data: vocabTransform,
      pagination
    }
  }

}
