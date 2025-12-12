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
import { ResponseDto } from '../dtos/response.dto';
import { ApiResponseData } from '../decorators/api-data-response.decorator';
import { ApiResponseEmpty } from '../decorators/api-empty-response.decorator';

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
  async findAllTests(@Query() query: PaginationDto): Promise<ResponseDto<PaginationResponseDto<ToeicTestDto>>> {
    const tests = await this.testsService.getAllTestsPagination(query);
    return {
      success: true,
      message: 'Fetched tests successfully',
      data: tests,
    };
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
