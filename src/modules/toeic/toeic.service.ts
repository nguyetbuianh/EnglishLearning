import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { ToeicPart } from '../../entities/toeic-part.entity';
import { ToeicTest } from '../../entities/toeic-test.entity';
import { Passage } from '../../entities/passage.entity';

@Injectable()
export class ToeicService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(ToeicPart)
    private readonly partRepo: Repository<ToeicPart>,
    @InjectRepository(Passage)
    private readonly passageRepo: Repository<Passage>,
    @InjectRepository(ToeicTest)
    private readonly testRepo: Repository<ToeicTest>,
  ) {}

  async getAllTests(): Promise<ToeicTest[]> {
    const tests = await this.testRepo.find({ order: { id: 'ASC' } });
    return tests;
  }


  // // Lấy câu hỏi tiếp theo cho user
  // async getNextQuestion(partId: number, lastQuestionNumber?: number): Promise<Question> {
  //   const part = await this.partRepo.findOne({ where: { id: partId } });
  //   if (!part) throw new NotFoundException('Part not found');

  //   const question = await this.questionRepo.findOne({
  //     where: {
  //       id: partId,
  //       question_number: lastQuestionNumber ? lastQuestionNumber + 1 : 1
  //     },
  //     relations: ['passage']
  //   });

  //   if (!question) throw new NotFoundException('No more questions in this part');

  //   return question;
  // }

  // // Lấy tất cả Part
  // async getAllParts(): Promise<ToeicPart[]> {
  //   return this.partRepo.find({ order: { part_number: 'ASC' } });
  // }

  // // Lấy test theo ID
  // async getTestById(testId: number): Promise<ToeicTest> {
  //   const test = await this.testRepo.findOne({ where: { id: testId } });
  //   if (!test) throw new NotFoundException('Test not found');
  //   return test;
  // }

  // // Lấy passage theo ID
  // async getPassageById(passageId: number): Promise<Passage> {
  //   const passage = await this.passageRepo.findOne({ where: { id: passageId } });
  //   if (!passage) throw new NotFoundException('Passage not found');
  //   return passage;
  // }
}
