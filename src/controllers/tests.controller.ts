import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ToeicTestService } from '../modules/toeic/services/toeic-test.service';
import { PaginationDto, PaginationResponseDto } from '../dtos/pagination.dto';
import { ContinueProgressDto, TestPartParamsDto } from '../dtos/test-part.dto';
import { UserAnswersDto } from '../dtos/user-answer.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { ToeicTest } from '../entities/toeic-test.entity';
import { QuestionWithUserAnswerDto } from '../dtos/question-answer.dto';
import { ApiPaginatedResponse } from '../decorators/api-paginated-response.decorator';
import { ToeicTestDto } from '../dtos/toeic-test.dto';
import { ToeicTestPracticeService } from '../services/toeic-test-practice.service';
import { UserResultDto } from '../dtos/user-result.dto';

@ApiBearerAuth('access-token')
@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: ToeicTestService,
    private readonly toeicTestPracticeService: ToeicTestPracticeService
  ) { }

  // GET /tests
  @Get()
  @ApiPaginatedResponse(ToeicTestDto)
  async findAllTests(@Query() query: PaginationDto): Promise<PaginationResponseDto<ToeicTest>> {
    const tests = await this.testsService.getAllTestsPagination(query);
    return tests;
  }

  // GET /:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched questions.',
    type: QuestionWithUserAnswerDto,
    isArray: true
  })
  async findQuestionTestPart(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Query() query: ContinueProgressDto
  ): Promise<QuestionWithUserAnswerDto[]> {
    const questions = await this.toeicTestPracticeService.getQuestionsForTestPart(req.user, params, query);
    return questions;
  }

  // POST /tests/:testId/parts/:partId/submit
  @Post(':testId/parts/:partId/submit')
  @ApiCreatedResponse({ description: 'Submit answers successfully.' })
  @HttpCode(HttpStatus.CREATED)
  async submitTestAnswers(
    @Request() req,
    @Param() params: TestPartParamsDto,
    @Body() submitAnswers: UserAnswersDto[]
  ): Promise<void> {
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
  }

  // GET /tests/:testId/results
  @Get(':testId/results')
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user answers.',
    type: UserResultDto
  })
  async getUserTestResult(
    @Request() req,
    @Param() param: TestPartParamsDto,
  ): Promise<UserResultDto> {
    const { userId } = req.user;
    const testId = param.testId;

    return await this.toeicTestPracticeService.getUserTestResult(
      userId,
      testId,
    );
  }
}
