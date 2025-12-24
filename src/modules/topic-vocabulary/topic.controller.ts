import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { TopicService } from "./topic.service";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { TopicIdParamDto } from "../../dtos/topic-response.dto";
import { VocabularyService } from "../vocabulary/vocabulary.service";
import { PaginationDto } from "../../dtos/pagination.dto";
import { plainToInstance } from "class-transformer";
import { TopicDetailResponse, TopicResponse, TopicTestResultResponse } from "../../responses/topic-response";
import { TestVocabResponse, VocabularyResponse } from "../../responses/vocab.response.";
import { PaginationResponse, SimpleResponse } from "../../responses/pagination.response";
import { TopicTestAnswersDto, TopicTestParamsDto } from "../../dtos/user-answer.dto";


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
  @ApiOkResponse({ type: PaginationResponse<TopicResponse> })
  async findAllTopics(
    @Query() paginationQuery: PaginationDto,
    @Query('limit') rawLimit?: string
  ): Promise<PaginationResponse<TopicResponse>> {
    const page = paginationQuery.page ?? 1;
    const limit = rawLimit ? parseInt(rawLimit) : 6;

    const { data, total } = await this.topicService.getAllTopicsPagination(page, limit);
    return {
      data: data,
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  //GET /random
  @Get('/random')
  @ApiOkResponse({
    type: SimpleResponse<TopicResponse[]>
  })
  async getRandomTopic(): Promise<SimpleResponse<TopicResponse[]>> {

    const data = await this.topicService.getRandomTopics();

    return { data }
  }

  //GET /:topicId/vocab
  @Get('/:topicId')
  @ApiOkResponse({
    type: SimpleResponse<TopicDetailResponse<VocabularyResponse>>
  })
  async findVocabsOfTopic(
    @Param() topicParams: TopicIdParamDto,
  ): Promise<SimpleResponse<TopicDetailResponse<VocabularyResponse>>> {
    const topicId = topicParams.topicId;
    const topic = await this.topicService.getTopicById(topicId);
    const data = await this.vocabService.getVocabsByTopicId(topicId);

    return {
      data: {
        id: topicId,
        name: topic.name,
        type: topic.type,
        vocabs: data
      }
    }
  }

  //GET /test/:topicId
  @Get('/test/:topicId')
  @ApiOkResponse({
    type: SimpleResponse<TopicDetailResponse<TestVocabResponse>>
  })
  async getTestTopic(
    @Param() topicParams: TopicIdParamDto,
  ): Promise<SimpleResponse<TopicDetailResponse<TestVocabResponse>>> {
    const topicId = topicParams.topicId;
    const topic = await this.topicService.getTopicById(topicId);
    const data = await this.vocabService.getTestVocabulariesByTopic(topicId);

    return {
      data: {
        id: topicId,
        name: topic.name,
        type: topic.type,
        vocabs: data
      }
    }
  }

  //POST /test/:topicId/submit
  @Post('/test/:topicId/submit')
  @ApiOkResponse({ type: SimpleResponse<TopicTestResultResponse> })
  async submitTestAnswers(
    @Request() req,
    @Param() params: TopicTestParamsDto,
    @Body() submitAnswers: TopicTestAnswersDto[]
  ): Promise<SimpleResponse<TopicTestResultResponse>> {
    const { topicId } = params;
    const { userId, userMezonId } = req.user;

    const result = await this.topicService.handleSubmitAnswers({
      topicId,
      userId,
      userMezonId,
      submitAnswers
    });

    return { data: result };
  }
}
