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

  async getNextQuestion(
    testId: number,
    partId: number,
    currentQuestionNumber: number
  ): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        questionNumber: MoreThan(currentQuestionNumber),
      },
      order: { questionNumber: "ASC" },
      relations: ["options", "test", "part"],
    });
  }

  async getNextQuestionWithPassage(
    testId: number,
    partId: number,
    currentQuestionNumber: number,
    passageId?: number
  ): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        passage: { id: passageId },
        questionNumber: MoreThan(currentQuestionNumber),
      },
      order: { questionNumber: "ASC" },
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
}
