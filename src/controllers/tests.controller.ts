import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ToeicTestService } from '../modules/toeic/services/toeic-test.service';
import { PaginationDto } from '../dtos/pagination.dto';
import { ToeicQuestionService } from '../modules/toeic/services/toeic-question.service';
import { ContinueProgressDto, TestPartParamsDto } from '../dtos/test-part.dto';
import { UserProgressService } from '../modules/toeic/services/user-progress.service';
import { UserAnswerService } from '../modules/toeic/services/user-answer.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptionEnum } from '../enum/option.enum';
import { UserAnswersDto } from '../dtos/user-answer.dto';
import { UserService } from '../modules/user/user.service';
import { User } from '../entities/user.entity';
import { UserStatService } from '../modules/daily/services/user-stat.service';
import { calculateToeicScore } from '../utils/calculateScore.util';
import { QuestionResultInterface, UserResultInterface } from '../interfaces/user-result.interface';
import { TOEIC_LISTENING_PART, TOEIC_PART, TOEIC_READING_PART } from '../contants/toeic-part.contant';

@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: ToeicTestService,
    private readonly questionsService: ToeicQuestionService,
    private readonly progressService: UserProgressService,
    private readonly answerService: UserAnswerService,
    private readonly userService: UserService,
    private readonly userStatService: UserStatService
  ) { }

  // GET /tests
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllTests(@Query() query: PaginationDto) {
    return this.testsService.getAllTestsPagination(query);
  }

  // GET /:testId/parts/:partId
  @Get(':testId/parts/:partId')
  @UseGuards(JwtAuthGuard)
  async findQuestionTestPart(
    @Req() req,
    @Param() query: TestPartParamsDto,
    @Query() params: ContinueProgressDto
  ) {
    const { testId, partId } = query;
    const { userId, userMezonId } = req.user;
    if (!testId || !partId || !userId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }

    if (params.isContinue) {
      const userAnswers = await this.answerService.getUserAnswersByPartAndTest(testId, partId, userId);
      const questions = await this.questionsService.getQuestionTestPart(query);

      const answerMap = new Map<number, OptionEnum>();
      userAnswers.forEach(ans => {
        answerMap.set(ans.questionId, ans.chosenOption);
      });

      const questionsWithUserAnswer = questions.map(q => ({
        ...q,
        userAnswers: answerMap.get(q.id) || null
      }));

      return {
        questions: questionsWithUserAnswer
      }
    } else {
      await this.progressService.deleteProgress(testId, partId, userMezonId);
      await this.answerService.deleteUserAnswersByPartAndTest(testId, partId, userId);

      return this.questionsService.getQuestionTestPart(query);
    }
  }

  // POST /tests/:testId/parts/:partId/submit
  @Post(':testId/parts/:partId/submit')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async submitTestAnswers(
    @Req() req,
    @Param() query: TestPartParamsDto,
    @Body() submitAnswers: UserAnswersDto[]
  ) {
    const { testId, partId } = query;
    const { userId, userMezonId } = req.user;
    if (!testId || !partId || !userId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }

    const user = await this.userService.getUser(userMezonId);
    if (!user) return;

    let totalQuestions = 0;
    let correctCount = 0;
    let scoreChange = 0;
    let partAnsweredCount = 0;

    await Promise.all(
      submitAnswers.map(async (ans) => {
        const { chosenOption, questionId } = ans;

        const question = await this.questionsService.findQuestionById(questionId);
        if (!question) return;

        totalQuestions++;

        if (question.part.id === Number(partId)) {
          partAnsweredCount++;
        }

        const isCorrect = chosenOption === question.correctOption;
        if (isCorrect) {
          correctCount++;
          scoreChange += 5;
        } else {
          scoreChange -= 5;
        }

        await this.answerService.recordAnswer({
          user: user as User,
          chosenOption,
          isCorrect,
          part: question.part,
          test: question.test,
          question,
        });
      })
    );

    await this.userStatService.updateUserStatsInApi(userId, {
      totalQuestions,
      correctCount,
      scoreChange
    });

    const lastAnswer = submitAnswers.at(-1);
    if (!lastAnswer) return;

    const partInfo = Object.values(TOEIC_PART).find(p => p.id === Number(partId));

    const isTotal = partAnsweredCount === partInfo!.total;
    const isEndQuestion = partInfo?.end === lastAnswer.questionId;

    if (isTotal && isEndQuestion) {
      const updateData = {
        userMezonId,
        testId,
        partId,
        currentQuestionNumber: lastAnswer.questionId,
        currentPassageNumber: lastAnswer.passageId,
        isCompleted: true,
      };
      await this.progressService.saveProgress(updateData);
    }
  }

  // GET /tests/:testId/results
  @Get(':testId/results')
  @UseGuards(JwtAuthGuard)
  async getUserTestResult(
    @Req() req,
    @Param('testId') testId: number,
  ): Promise<UserResultInterface> {
    const { userId } = req.user;

    const userAnswers = await this.answerService.getUserAnswersByTest(
      userId,
      testId
    );

    if (!userAnswers || userAnswers.length === 0) {
      throw new NotFoundException("User has not done this test yet");
    }

    const partStats = new Map<number, {
      correct: number;
      total: number;
      questions: QuestionResultInterface[];
    }>();

    for (const ua of userAnswers) {
      const partNumber = ua.part.partNumber;
      const question = ua.question;

      if (!partStats.has(partNumber)) {
        partStats.set(partNumber, {
          correct: 0,
          total: 0,
          questions: []
        });
      }

      const stat = partStats.get(partNumber)!;

      stat.total++;

      const isCorrect = ua.isCorrect;
      if (isCorrect) stat.correct++;

      stat.questions.push({
        questionNumber: question.questionNumber,
        chosenOption: ua.chosenOption,
        correctOption: question.correctOption,
        isCorrect: isCorrect,
      });
    }

    let listeningCorrect = 0,
      listeningTotal = 0,
      readingCorrect = 0,
      readingTotal = 0;

    for (const [partNumber, stat] of partStats.entries()) {
      if (Object.values(TOEIC_LISTENING_PART).includes(partNumber)) {
        listeningCorrect += stat.correct;
        listeningTotal += stat.total;
      }

      if (Object.values(TOEIC_READING_PART).includes(partNumber)) {
        readingCorrect += stat.correct;
        readingTotal += stat.total;
      }
    }

    const listeningScore = calculateToeicScore(listeningCorrect, listeningTotal);
    const readingScore = calculateToeicScore(readingCorrect, readingTotal);

    const result: UserResultInterface = {
      testId,
      userId,
      score: {
        listeningScore,
        readingScore,
        totalScore: listeningScore + readingScore,
      },
      parts: [...partStats.entries()].map(([partNumber, stat]) => ({
        partNumber,
        correct: stat.correct,
        total: stat.total,
        questions: stat.questions
      }))
    };

    return result;
  }
}
