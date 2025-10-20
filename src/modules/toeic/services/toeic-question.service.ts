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

  async findQuestionById(questionId: number): Promise<Question | null> {
    return await this.questionRepo.findOne({
      where: { id: questionId },
      relations: ['part', 'test']
    });
  }
}
