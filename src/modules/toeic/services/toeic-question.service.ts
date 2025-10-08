import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from 'src/entities/question.entity';

@Injectable()
export class ToeicQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) { }

  // Fetch the first question
  async getFirstQuestion(testId: number, partId: number): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
      },
      relations: ['options'],
      order: { id: 'ASC' },
    });
  }

  // Fetch the question by question_id
  async getQuestionById(questionId: number): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: { id: questionId },
      relations: ['options', 'test', 'part'],
    });
  }

  async getNextQuestion(testId: number, partId: number, currentQuestionNumber: number) {
    return this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        question_number: currentQuestionNumber + 1
      },
      relations: ["options"],
    });
  }
}
