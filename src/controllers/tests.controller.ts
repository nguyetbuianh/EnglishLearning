import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  BadRequestException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ToeicTestService } from '../modules/toeic/services/toeic-test.service';
import { PaginationDto } from '../dtos/pagination.dto';
import { ContinueProgressDto, TestPartParamsDto } from '../dtos/test-part.dto';
import { UserAnswersDto } from '../dtos/user-answer.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QuestionWithUserAnswerDto } from '../dtos/question-answer.dto';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';
import { ToeicTestDto } from '../dtos/toeic-test.dto';
import { ToeicTestPracticeService } from '../services/toeic-test-practice.service';
import { UserResultDto } from '../dtos/user-result.dto';
import { ResponseDto } from '../dtos/response.dto';
import { ApiResponseData } from '../decorators/api-data-response.decorator';
import { ApiResponseEmpty } from '../decorators/api-empty-response.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserProgressService } from '../modules/toeic/services/user-progress.service';
import { PartProgressDetailDto } from '../dtos/part-progress-detail.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: ToeicTestService,
    private readonly toeicTestPracticeService: ToeicTestPracticeService,
    private readonly progressService: UserProgressService
  ) { }

  // GET /tests
  @Get()
  @ApiPaginatedResponse(ToeicTestDto)
  async findAllTests(
    @Request() req,
    @Query() query: PaginationDto
  ): Promise<ResponseDto<ToeicTestDto[]>> {
    const { items, pagination } =
      await this.testsService.getAllTestsPagination(query);

    const progressMap =
      await this.toeicTestPracticeService.getTestWithProgress(req.user);

    const itemsWithProgress = items.map(test => ({
      ...test,
      partsProcess: progressMap.get(test.id) ?? null,
    }));

    return {
      success: true,
      message: 'Fetched tests successfully',
      data: itemsWithProgress,
      pagination,
    };
  }

  //GET /tests/:testId
  @Get(':testId/detail')
  @ApiResponseData(PartProgressDetailDto, true)
  async findTestDetail(
    @Request() req,
    @Param() params: TestPartParamsDto
  ): Promise<ResponseDto<PartProgressDetailDto[]>> {
    const { testId } = params;
    const { userMezonId } = req.user;

    if (!testId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }
    const testProgress = await this.progressService.getProgressTest(testId, userMezonId);

    const result: PartProgressDetailDto[] = testProgress!.map(p => ({
      partId: p.partId,
      partNumber: p.part.partNumber,
      partTitle: p.part.title,
      currentQuestionNumber: p.currentQuestionNumber,
      currentPassageNumber: p.currentPassageNumber,
      isCompleted: p.isCompleted,
    }));

    return {
      success: true,
      message: 'Fetched tests successfully',
      data: result
    }
  }

  // GET /:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @ApiResponseData(QuestionWithUserAnswerDto, true)
  async findQuestionTestPart(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Query() query: ContinueProgressDto
  ): Promise<ResponseDto<QuestionWithUserAnswerDto[]>> {
    const questions = await this.toeicTestPracticeService.getQuestionsForTestPart(req.user, params, query);
    return {
      success: true,
      message: 'Fetched questions successfully',
      data: questions
    };
  }

  // POST /tests/:testId/parts/:partId/submit
  @Post(':testId/parts/:partId/submit')
  @ApiResponseEmpty()
  async submitTestAnswers(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Body() submitAnswers: UserAnswersDto[]
  ): Promise<ResponseDto<null>> {
    const { testId, partId } = params;
    const { userId, userMezonId } = req.user;

    if (!testId || !partId || !userId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }

    await this.toeicTestPracticeService.handleSubmitAnswers({
      testId,
      partId,
      userId,
      userMezonId,
      submitAnswers,
    });

    return {
      success: true,
      message: 'Created record successfully',
      data: null
    };
  }

  // GET /tests/:testId/results
  @Get(':testId/results')
  @ApiResponseData(UserResultDto)
  async getUserTestResult(
    @Request() req,
    @Param() param: TestPartParamsDto,
  ): Promise<ResponseDto<UserResultDto>> {
    const { userId } = req.user;
    const testId = param.testId;

    const result = await this.toeicTestPracticeService.getUserTestResult(
      userId,
      testId,
    );

    return {
      success: true,
      message: 'Fetched result successfully',
      data: result
    }
  }
}
