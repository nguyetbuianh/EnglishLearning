import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAnswer } from "src/entities/user-answer.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepo: Repository<UserAnswer>
  ) { }

  async recordAnswer(userAnswer: UserAnswer): Promise<UserAnswer> {
    return this.userAnswerRepo.save(userAnswer);
  }

  async getUserAnswersByPartAndTest(
    testId: number,
    partId: number,
    userId: number,
  ): Promise<UserAnswer[]> {
    return this.userAnswerRepo.find({
      where: {
        user: { id: userId },
        toeicTest: { id: testId },
        toeicPart: { id: partId },
      },
      relations: ['question', 'toeicPart', 'toeicTest'],
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
      toeicTest: { id: testId },
      toeicPart: { id: partId },
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
}