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
import { ProgressDetailResponse } from '../../responses/part-progress-detail.response';
import { TestWithProgressResponse } from '../../responses/user-progress.response';
import { ContinueProgressDto, TesParamsDto, TestPartParamsDto } from '../../dtos/test-part.dto';
import { ToeicTestService } from './services/toeic-test.service';
import { UserProgressService } from './services/user-progress.service';
import { ToeicQuestionService } from './services/toeic-question.service';
import { UserAnswerService } from './services/user-answer.service';
import { UserResultDto } from '../../dtos/user-result.dto';
import { plainToInstance } from 'class-transformer';
import { DataResponse } from '../../responses/data.response';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('toeic/tests')
export class ToeicController {
  constructor(
    private readonly toeicTestService: ToeicTestService,
    private readonly userProgressService: UserProgressService,
    private readonly questionService: ToeicQuestionService,
    private readonly userAnswerService: UserAnswerService
  ) { }

  // GET toeic/tests
  @Get()
  @ApiOkResponse({
    type: DataResponse<TestWithProgressResponse>,
  })
  async findAllTests(
    @Request() req,
    @Query() query: PaginationDto
  ): Promise<DataResponse<TestWithProgressResponse>> {
    const { items, pagination } = await this.toeicTestService.findAllTestsWithProgress(
      query,
      req.user,
    );

    return {
      data: items,
      pagination
    }
  }

  //GET toeic/tests/:testId
  @Get(':testId')
  @ApiOkResponse({
    type: DataResponse<ProgressDetailResponse>,
    isArray: true,
  })
  async findTestDetail(
    @Request() req,
    @Param() params: TesParamsDto
  ): Promise<DataResponse<ProgressDetailResponse>> {
    const { testId } = params;
    const { userMezonId } = req.user;

    const progressDetail = await this.userProgressService.getTestDetailProgress(
      testId,
      userMezonId,
    );

    return {
      data: progressDetail
    }
  }

  // GET toeic/:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @ApiOkResponse({
    type: DataResponse<QuestionWithUserAnswerResponse>,
    isArray: true,
  })
  async findQuestionTestPart(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Query() query: ContinueProgressDto
  ): Promise<DataResponse<QuestionWithUserAnswerResponse[]>> {
    const question =
      await this.questionService.getQuestionsForTestPart(
        req.user,
        params,
        query
      );

    const questionTransform = plainToInstance(
      QuestionWithUserAnswerResponse,
      question,
      { excludeExtraneousValues: true }
    );

    return {
      data: questionTransform
    }
  }

  // POST toeic/tests/:testId/parts/:partId/submit
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

  // GET toeic/tests/:testId/results
  @Get(':testId/results')
  @ApiOkResponse({
    type: DataResponse<UserResultDto>,
  })
  async getUserTestResult(
    @Request() req,
    @Param() param: TesParamsDto,
  ): Promise<DataResponse<UserResultDto>> {
    const { userId } = req.user;
    const testId = param.testId;

    const result = await this.userAnswerService.getUserTestResult(
      userId,
      testId,
    );

    return {
      data: result
    };
  }
}
