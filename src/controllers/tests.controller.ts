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
import { PaginationDto } from '../dtos/pagination.dto';
import { ContinueProgressDto, TestPartParamsDto } from '../dtos/test-part.dto';
import { UserAnswersDto } from '../dtos/user-answer.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { QuestionWithUserAnswerDto } from '../dtos/question-answer.dto';
import { ToeicTestPracticeService } from '../services/toeic-test-practice.service';
import { UserResultDto } from '../dtos/user-result.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PartProgressDetailDto } from '../dtos/part-progress-detail.dto';
import { TestPaginationResponseDto } from '../dtos/user-progress.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  constructor(
    private readonly toeicTestPracticeService: ToeicTestPracticeService
  ) { }

  // GET /tests
  @Get()
  @ApiOkResponse({
    type: TestPaginationResponseDto,
  })
  async findAllTests(
    @Request() req,
    @Query() query: PaginationDto
  ): Promise<TestPaginationResponseDto> {
    return this.toeicTestPracticeService.findAllTestsWithProgress(
      query,
      req.user,
    );
  }

  //GET /tests/:testId
  @Get(':testId/detail')
  @ApiOkResponse({
    type: PartProgressDetailDto,
    isArray: true,
  })
  async findTestDetail(
    @Request() req,
    @Param() params: TestPartParamsDto
  ): Promise<PartProgressDetailDto[]> {
    const { testId } = params;
    const { userMezonId } = req.user;

    return this.toeicTestPracticeService.getTestDetailProgress(
      testId,
      userMezonId,
    );
  }

  // GET /:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @ApiOkResponse({
    type: PartProgressDetailDto,
    isArray: true,
  })
  async findQuestionTestPart(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Query() query: ContinueProgressDto
  ): Promise<QuestionWithUserAnswerDto[]> {
    return this.toeicTestPracticeService.getQuestionsForTestPart(req.user, params, query);
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

    return this.toeicTestPracticeService.handleSubmitAnswers({
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
    @Param() param: TestPartParamsDto,
  ): Promise<UserResultDto> {
    const { userId } = req.user;
    const testId = param.testId;

    const result = await this.toeicTestPracticeService.getUserTestResult(
      userId,
      testId,
    );

    return result;
  }
}
