import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAnswer } from "../../../entities/user-answer.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepo: Repository<UserAnswer>
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
}