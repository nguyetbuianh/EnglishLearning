import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { ToeicPart } from '../../entities/toeic-part.entity';
import { ToeicTest } from '../../entities/toeic-test.entity';
import { Passage } from '../../entities/passage.entity';
import { UserProgress } from 'src/entities/user-progress.entity';
import { User } from 'src/entities/user.entity';

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
    @InjectRepository(UserProgress)
    private readonly progressRepo: Repository<UserProgress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Fetch all existing tests
  async getAllTests(): Promise<ToeicTest[]> {
    return this.testRepo.find({ order: { id: 'ASC' } });
  }

  // Fetch progress of the user
  async getProgress(userId: number, testId: number, partId: number): Promise<UserProgress | null> {
    return this.progressRepo.findOne({
      where: {
        user: { id: userId },
        test: { id: testId },
        part: { id: partId },
      },
      relations: ['currentQuestion', 'test', 'part'],
    });
  }

  // Update a progress of the user
  async updateProgress(data: {
    userId: number; 
    testId: number;
    partId: number;
    currentQuestionId?: number;
  }): Promise<UserProgress> {
    const existing = await this.getProgress(data.userId, data.testId, data.partId);

    if (existing) {
      existing.currentQuestion = data.currentQuestionId
        ? ({ id: data.currentQuestionId } as any)
        : null;
      return this.progressRepo.save(existing);
    }

    const newProgress = this.progressRepo.create({
      user: { id: data.userId } as any,
      test: { id: data.testId } as any,
      part: { id: data.partId } as any,
      currentQuestion: data.currentQuestionId
        ? ({ id: data.currentQuestionId } as any)
        : null,
    });

    return this.progressRepo.save(newProgress);
  }

  // Create a progress of the user
  async createProgress(data: {
    userId: number;
    testId: number;
    partId: number;
    currentQuestionId: number;
  }) {
    const progress = this.progressRepo.create({
      user: { id: data.userId },
      test: { id: data.testId },
      part: { id: data.partId },
      currentQuestion: { id: data.currentQuestionId },
    });

    return this.progressRepo.save(progress);
  }

  // Fetch the last progress
  async getLastProgress(userMezonId: string): Promise<UserProgress | null> {
    return this.progressRepo.findOne({
      where: { user: { mezon_user_id: userMezonId } },
      order: { lastUpdated: 'DESC' },
      relations: ['test', 'part', 'currentQuestion'],
    });
  }

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

  // // 
  async startPart(userMezonId: string, testId: number, partId: number, firstQuestionId: number) {
    const progress = this.progressRepo.create({
      user: { mezon_user_id: userMezonId } as any,
      test: { id: testId } as any,
      part: { id: partId } as any,
      currentQuestion: { id: firstQuestionId } as any,
    });

    return this.progressRepo.save(progress);
  }
}
