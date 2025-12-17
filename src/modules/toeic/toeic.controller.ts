import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../../dtos/pagination.dto';
import { UserAnswersDto } from '../../dtos/user-answer.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { QuestionWithUserAnswerResponse } from '../../responses/question-answer.response';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { PartProgressDetailResponse, ProgressDetailResponse } from '../../responses/part-progress-detail.response';
import { TestPaginationResponseResponse } from '../../responses/user-progress.response';
import { ContinueProgressDto, TesParamsDto, TestPartParamsDto } from '../../dtos/test-part.dto';
import { ToeicTestService } from './services/toeic-test.service';
import { UserProgressService } from './services/user-progress.service';
import { ToeicQuestionService } from './services/toeic-question.service';
import { UserAnswerService } from './services/user-answer.service';
import { UserResultDto } from '../../dtos/user-result.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tests/toeic')
export class ToeicController {
  constructor(
    private readonly toeicTestService: ToeicTestService,
    private readonly userProgressService: UserProgressService,
    private readonly questionService: ToeicQuestionService,
    private readonly userAnswerService: UserAnswerService
  ) { }

  // GET /tests
  @Get()
  @ApiOkResponse({
    type: TestPaginationResponseResponse,
  })
  async findAllTests(
    @Request() req,
    @Query() query: PaginationDto
  ): Promise<TestPaginationResponseResponse> {
    return this.toeicTestService.findAllTestsWithProgress(
      query,
      req.user,
    );
  }

  //GET /tests/:testId
  @Get(':testId/detail')
  @ApiOkResponse({
    type: ProgressDetailResponse,
    isArray: true,
  })
  async findTestDetail(
    @Request() req,
    @Param() params: TesParamsDto
  ): Promise<ProgressDetailResponse> {
    const { testId } = params;
    const { userMezonId } = req.user;

    return this.userProgressService.getTestDetailProgress(
      testId,
      userMezonId,
    );
  }

  // GET /:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @ApiOkResponse({
    type: PartProgressDetailResponse,
    isArray: true,
  })
  async findQuestionTestPart(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Query() query: ContinueProgressDto
  ): Promise<QuestionWithUserAnswerResponse[]> {
    const data =
      await this.questionService.getQuestionsForTestPart(
        req.user,
        params,
        query
      );

    return plainToInstance(
      QuestionWithUserAnswerResponse,
      data,
      { excludeExtraneousValues: true }
    );
  }
  // POST /tests/:testId/parts/:partId/submit
  @Post(':testId/parts/:partId/submit')
  @ApiCreatedResponse()
  async submitTestAnswers(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Body() submitAnswers: UserAnswersDto[]
  ): Promise<void> {
    const { testId, partId } = params;
    const { userId, userMezonId } = req.user;

    return this.userAnswerService.handleSubmitAnswers({
      testId,
      partId: partId!,
      userId,
      userMezonId,
      submitAnswers,
    });
  }

  // GET /tests/:testId/results
  @Get(':testId/results')
  @ApiOkResponse({
    type: UserResultDto,
  })
  async getUserTestResult(
    @Request() req,
    @Param() param: TesParamsDto,
  ): Promise<UserResultDto> {
    const { userId } = req.user;
    const testId = param.testId;

    const result = await this.userAnswerService.getUserTestResult(
      userId,
      testId,
    );

    return result;
  }
}
