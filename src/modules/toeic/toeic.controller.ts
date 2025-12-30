import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../../dtos/pagination.dto';
import { UserAnswersDto } from '../../dtos/user-answer.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { QuestionWithUserAnswerResponse } from '../../responses/question-answer.response';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { ProgressDetailResponse } from '../../responses/part-progress-detail.response';
import { TestWithProgressResponse } from '../../responses/user-progress.response';
import { ContinueProgressDto, TestParamsDto, TestPartParamsDto } from '../../dtos/test-part.dto';
import { ToeicTestService } from './services/toeic-test.service';
import { ToeicPartService } from './services/toeic-part.service';
import { UserProgressService } from './services/user-progress.service';
import { ToeicQuestionService } from './services/toeic-question.service';
import { UserAnswerService } from './services/user-answer.service';
import { UserResultDto } from '../../dtos/user-result.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationResponse, SimpleResponse } from '../../responses/pagination.response';
import { PartQuestionResponse } from '../../responses/part-question.response';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('toeic/tests')
export class ToeicController {
  constructor(
    private readonly toeicTestService: ToeicTestService,
    private readonly userProgressService: UserProgressService,
    private readonly questionService: ToeicQuestionService,
    private readonly userAnswerService: UserAnswerService,
    private readonly toeicPartService: ToeicPartService,
  ) { }

  // GET toeic/tests
  @Get()
  @ApiOkResponse({
    type: PaginationResponse<TestWithProgressResponse>,
  })
  async findAllTests(
    @Request() req,
    @Query() query: PaginationDto
  ): Promise<PaginationResponse<TestWithProgressResponse>> {
    const { data, pagination } = await this.toeicTestService.findAllTestsWithProgress(
      query,
      req.user,
    );

    return {
      data,
      pagination
    }
  }

  //GET toeic/tests/:testId
  @Get(':testId')
  @ApiOkResponse({
    type: SimpleResponse<ProgressDetailResponse>,
    isArray: true,
  })
  async findTestDetail(
    @Param() params: TestParamsDto
  ): Promise<SimpleResponse<ProgressDetailResponse>> {
    const { testId } = params;


    const [test, parts] = await Promise.all([
      this.toeicTestService.findTestById(testId),
      this.toeicPartService.getAllParts()
    ]);

    return {
      data: {
        test,
        parts: parts.map(part => ({
          partId: part.id,
          partNumber: part.partNumber,
          partTitle: part.title,
          isCompleted: false,
        })),
      }
    };
  }

  // GET toeic/:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @ApiOkResponse({
    type: SimpleResponse<PartQuestionResponse>,
    isArray: true,
  })
  async findQuestionTestPart(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Query() query: ContinueProgressDto
  ): Promise<SimpleResponse<PartQuestionResponse[]>> {
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

    const part = await this.toeicPartService.findPartById(params.partId);

    const partQuestion: PartQuestionResponse = {
      partId: params.partId,
      partNumber: part.partNumber,
      questions: questionTransform,
    };

    return {
      data: [partQuestion],
    };
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
    type: SimpleResponse<UserResultDto>,
  })
  async getUserTestResult(
    @Request() req,
    @Param() param: TestParamsDto,
  ): Promise<SimpleResponse<UserResultDto>> {
    const userId = req.user.userId;
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
