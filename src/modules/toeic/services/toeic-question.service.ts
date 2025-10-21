import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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
      relations: ['options', 'test', 'part'],
      order: { id: 'ASC' },
    });
  }

  async getQuestion(
    testId: number,
    partId: number,
    questionNumber: number
  ): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        questionNumber: questionNumber,
      },
      relations: ["options", "test", "part"],
    });
  }

  async getQuestionWithPassage(
    testId: number,
    partId: number,
    questionNumber: number,
    passageId?: number
  ): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        passage: { id: passageId },
        questionNumber: questionNumber,
      },
      relations: ["options", "passage", "test", "part"],
    });
  }

  async getFirstQuestionByPassage(passageId: number): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        passage: { id: passageId },
      },
      relations: ['options', 'passage', 'test', 'part'],
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
