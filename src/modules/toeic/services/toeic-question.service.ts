import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';

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
      relations: ['options', 'test', 'part', 'passage'],
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
      relations: ["options", "test", "part", "passage"],
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
      relations: ['options', 'test', 'part', 'passage'],
      order: { id: 'ASC' },
    });
  }

  async findQuestionById(questionId: number): Promise<Question | null> {
    return await this.questionRepo.findOne({
      where: { id: questionId },
      relations: ['passage'],
    });
  }

  async getRandomQuestion(): Promise<Question | null> {
    const partIds = [5, 6, 7];

    const count = await this.questionRepo.count({
      where: { part: { id: In(partIds) } },
    });

    if (count === 0) return null;

    const randomOffset = Math.floor(Math.random() * count);

    const [question] = await this.questionRepo.find({
      where: { part: { id: In(partIds) } },
      relations: ['options', 'part', 'test', 'passage'],
      skip: randomOffset,
      take: 1,
    });

    return question || null;
  }

  async saveQuestion(question: Question): Promise<Question> {
    return this.questionRepo.save(question)
  }

  async updateQuestion(
    part: number,
    test: number,
    questionNumber: number,
    updateData: Partial<Question>,
  ): Promise<void> {
    await this.questionRepo.update(
      {
        part: { id: part },
        test: { id: test },
        questionNumber: questionNumber,
      },
      {
        explanation: updateData.explanation,
      },
    );
  }

}
