import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAnswer } from "../../../entities/user-answer.entity";
import { Repository } from "typeorm";
import { CheckCompletionInterface, SaveProgressInterface, SubmitTestInterface } from "../../../interfaces/submit-test.interface";
import { UserService } from "../../user/user.service";
import { User } from "../../../entities/user.entity";
import { ToeicQuestionService } from "./toeic-question.service";
import { StatService } from "../../stat/stat.service";
import { TOEIC_LISTENING_PART, TOEIC_PART, TOEIC_READING_PART } from "../../../contants/toeic-part.contant";
import { UserProgressService } from "./user-progress.service";
import { Question } from "../../../entities/question.entity";
import { calculateToeicScore } from "../../../utils/calculateScore.util";
import { PartStatInterface, UserResultInterface } from "../../../interfaces/user-result.interface";
import { ToeicTestService } from "./toeic-test.service";

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepo: Repository<UserAnswer>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    private readonly userService: UserService,
    private readonly statService: StatService,
    private readonly progressService: UserProgressService,
    private readonly testService: ToeicTestService
  ) { }

  async recordAnswer(userAnswer: Partial<UserAnswer>): Promise<void> {
    await this.userAnswerRepo.upsert(userAnswer, ['question', 'user', 'part', 'test']);
  }

  async getUserAnswersByPartAndTest(
    testId: number,
    partId: number,
    userId: number,
  ): Promise<UserAnswer[]> {
    return this.userAnswerRepo.find({
      where: {
        user: { id: userId },
        test: { id: testId },
        part: { id: partId },
      },
      relations: ['question', 'part', 'test'],
      order: {
        question: { id: 'ASC' },
      },
    });
  }

  async deleteUserAnswersByPartAndTest(
    testId: number,
    partId: number,
    userId: number,
  ): Promise<void> {
    await this.userAnswerRepo.delete({
      user: { id: userId },
      test: { id: testId },
      part: { id: partId },
    });
  }

  async deleteUserAnswerByUserAndQuestion(
    userId: number,
    questionId: number,
  ): Promise<void> {
    await this.userAnswerRepo.delete({
      user: { id: userId },
      question: { id: questionId },
    });
  }

  async getUserAnswersByTest(userId: number, testId: number) {
    return await this.userAnswerRepo.find({
      where: {
        user: { id: userId },
        test: { id: testId },
      },
      relations: ["part", "test", "question"],
      order: {
        part: { partNumber: "ASC" },
        question: { questionNumber: "ASC" },
      },
    });
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

        const question = await this.questionRepo.findOne({
          where: { id: questionId },
          relations: ['passage', 'part', 'test'],
        });

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

        await this.recordAnswer({
          user,
          chosenOption,
          isCorrect,
          part: question.part,
          test: question.test,
          question
        });
      })
    );

    await this.statService.updateUserStatsInApi(userId, {
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

  async getValidatedAnswers(userId: number, testId: number) {
    const answers = await this.getUserAnswersByTest(userId, testId);
    if (!answers || answers.length === 0) {
      throw new NotFoundException("User has not done this test yet");
    }
    return answers;
  }

  async getUserTestResult(
    userId: number,
    testId: number,
  ): Promise<UserResultInterface> {
    const [userAnswers, test] = await Promise.all([
      this.getValidatedAnswers(userId, testId),
      this.testService.getValidatedTest(testId)
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