import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContinueProgressDto, TestPartParamsDto } from '../dtos/test-part.dto';
import { UserInterface } from '../interfaces/user.interface';
import { UserAnswerService } from '../modules/toeic/services/user-answer.service';
import { ToeicQuestionService } from '../modules/toeic/services/toeic-question.service';
import { UserProgressService } from '../modules/toeic/services/user-progress.service';
import { QuestionWithUserAnswerDto } from '../dtos/question-answer.dto';
import { CheckCompletionInterface, SaveProgressInterface, SubmitTestInterface } from '../interfaces/submit-test.interface';
import { UserService } from '../modules/user/user.service';
import { UserStatService } from '../modules/daily/services/user-stat.service';
import { TOEIC_LISTENING_PART, TOEIC_PART, TOEIC_READING_PART } from '../contants/toeic-part.contant';
import { PartStatInterface, UserResultInterface } from '../interfaces/user-result.interface';
import { calculateToeicScore } from '../utils/calculateScore.util';
import { ToeicTestService } from '../modules/toeic/services/toeic-test.service';
import { UserAnswer } from '../entities/user-answer.entity';
import { User } from '../entities/user.entity';
import { UserProgress } from '../entities/progress.entity';
import { TestPaginationResponseDto } from '../dtos/user-progress.dto';
import { PaginationInterface } from '../interfaces/pagination.interface';
import { PartProgressDetailDto } from '../dtos/part-progress-detail.dto';

@Injectable()
export class ToeicTestPracticeService {
  constructor(
    private readonly answerService: UserAnswerService,
    private readonly questionsService: ToeicQuestionService,
    private readonly progressService: UserProgressService,
    private readonly userService: UserService,
    private readonly userStatService: UserStatService,
    private readonly testService: ToeicTestService,
    private readonly userProgressService: UserProgressService
  ) { }


  async findAllTestsWithProgress(
    query: PaginationInterface,
    user: UserInterface,
  ): Promise<TestPaginationResponseDto> {
    const { items, pagination } =
      await this.testService.getAllTestsPagination(query);

    const progressMap =
      await this.getTestWithProgress(user);

    const itemsWithProgress = items.map(test => ({
      ...test,
      partsProcess: progressMap.get(test.id) ?? null,
    }));

    return {
      items: itemsWithProgress,
      pagination,
    };
  }

  async getTestWithProgress(
    user: UserInterface
  ): Promise<Map<number, number | null>> {

    const { userMezonId } = user;

    const userProgress =
      await this.userProgressService.getProgressByUserId(userMezonId);

    const progressMap = new Map<number, number | null>();

    const grouped = new Map<number, { total: number; completed: number }>();

    for (const progress of userProgress) {
      const testId = progress.testId;

      if (!grouped.has(testId)) {
        grouped.set(testId, { total: 0, completed: 0 });
      }

      const stat = grouped.get(testId)!;
      stat.total += 1;

      if (progress.isCompleted) {
        stat.completed += 1;
      }
    }

    for (const [testId, stat] of grouped.entries()) {
      if (stat.total === 0) {
        progressMap.set(testId, null);
      } else if (stat.completed === 0) {
        progressMap.set(testId, 0);
      } else {
        progressMap.set(testId, stat.completed);
      }
    }

    return progressMap;
  }

  async getTestDetailProgress(
    testId: number,
    userMezonId: string,
  ): Promise<PartProgressDetailDto[]> {
    const testProgress =
      await this.progressService.getProgressTest(testId, userMezonId);

    if (!testProgress || testProgress.length === 0) {
      return [];
    }

    return testProgress.map(p => ({
      partId: p.partId,
      partNumber: p.part.partNumber,
      partTitle: p.part.title,
      isCompleted: p.isCompleted,
    }));
  }

  async getQuestionsForTestPart(
    user: UserInterface,
    routeParams: TestPartParamsDto,
    query: ContinueProgressDto
  ): Promise<QuestionWithUserAnswerDto[]> {

    const { userId, userMezonId } = user;
    const { testId, partId } = routeParams;

    if (!testId || !partId || !userId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }

    if (query.isContinue) {
      return this.handleContinueMode(testId, partId, userId);
    }

    return this.handleRestartMode(testId, partId, userId, userMezonId);
  }

  private async handleContinueMode(testId: number, partId: number, userId: number): Promise<QuestionWithUserAnswerDto[]> {
    const userAnswers = await this.answerService.getUserAnswersByPartAndTest(testId, partId, userId);
    const questions = await this.questionsService.getQuestionTestPart({ testId, partId });

    const answerMap = new Map(userAnswers.map(a => [a.questionId, a.chosenOption]));

    const result = questions.map(q => ({
      ...q,
      userAnswer: answerMap.get(q.id) ?? null,
    }));

    return result;
  }

  private async handleRestartMode(testId: number, partId: number, userId: number, userMezonId: string): Promise<QuestionWithUserAnswerDto[]> {
    await this.progressService.deleteProgress(testId, partId, userMezonId);
    await this.answerService.deleteUserAnswersByPartAndTest(testId, partId, userId);

    const questions = await this.questionsService.getQuestionTestPart({ testId, partId });

    const result = questions.map(q => ({
      ...q,
      userAnswer: null,
    }));

    return result;
  }

  async handleSubmitAnswers(submitTest: SubmitTestInterface) {
    const { testId, partId, userId, userMezonId, submitAnswers } = submitTest;

    const user = await this.userService.getUser(userMezonId, false) as User;
    if (!user) throw new NotFoundException('User not found');

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
          user,
          chosenOption,
          isCorrect,
          part: question.part,
          test: question.test,
          question
        });
      })
    );

    await this.userStatService.updateUserStatsInApi(userId, {
      totalQuestions,
      correctCount,
      scoreChange
    });

    await this.checkAndSavePartCompletion({
      partId,
      testId,
      userMezonId,
      submitAnswers,
      partAnsweredCount
    });
  }

  private async checkAndSavePartCompletion(
    checkCompletion: CheckCompletionInterface
  ) {
    const { partId, testId, userMezonId, submitAnswers, partAnsweredCount } = checkCompletion;

    const lastAnswer = submitAnswers.at(-1);
    if (!lastAnswer) {
      throw new BadRequestException('No answers submitted');
    }

    const partInfo = Object.values(TOEIC_PART).find(p => p.id === Number(partId));
    if (!partInfo) return;

    const isTotal = partAnsweredCount === partInfo.total;
    const isEndQuestion = partInfo.end === lastAnswer.questionId;

    const progressPayload: SaveProgressInterface = {
      userMezonId,
      testId,
      partId,
      currentQuestionNumber: lastAnswer.questionId,
      currentPassageNumber: lastAnswer.passageId
    };

    if (isTotal && isEndQuestion) {
      progressPayload.isCompleted = true;
    }

    await this.progressService.saveProgress(progressPayload);
  }

  async getUserTestResult(
    userId: number,
    testId: number,
  ): Promise<UserResultInterface> {
    const [userAnswers, test] = await Promise.all([
      this.getValidatedAnswers(userId, testId),
      this.getValidatedTest(testId)
    ]);

    const partStats = this.buildPartStats(userAnswers);
    const score = this.calculateScores(partStats);

    return {
      testTitle: test.title,
      score,
      parts: [...partStats.entries()].map(([partNumber, stat]) => ({
        partNumber,
        correct: stat.correct,
        total: stat.total,
        questions: stat.questions,
      })),
    };
  }

  private async getValidatedAnswers(userId: number, testId: number) {
    const answers = await this.answerService.getUserAnswersByTest(userId, testId);
    if (!answers || answers.length === 0) {
      throw new NotFoundException("User has not done this test yet");
    }
    return answers;
  }

  private async getValidatedTest(testId: number) {
    const test = await this.testService.findTestById(testId);
    if (!test) throw new NotFoundException("Test not found");
    return test;
  }

  private buildPartStats(userAnswers: UserAnswer[]): Map<number, PartStatInterface> {
    const partStats = new Map<number, PartStatInterface>();

    for (const ua of userAnswers) {
      const partNumber = ua.part.partNumber;
      const question = ua.question;

      if (!partStats.has(partNumber)) {
        partStats.set(partNumber, { correct: 0, total: 0, questions: [] });
      }

      const stat = partStats.get(partNumber)!;
      stat.total++;
      if (ua.isCorrect) stat.correct++;

      stat.questions.push({
        questionNumber: question.questionNumber,
        chosenOption: ua.chosenOption,
        correctOption: question.correctOption,
        isCorrect: ua.isCorrect,
      });
    }

    return partStats;
  }

  private calculateScores(partStats: Map<number, PartStatInterface>) {
    let listeningCorrect = 0, listeningTotal = 0;
    let readingCorrect = 0, readingTotal = 0;

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

    return {
      listeningScore,
      readingScore,
      totalScore: listeningScore + readingScore
    };
  }
}