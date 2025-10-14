import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from 'src/entities/user-progress.entity';


@Injectable()
export class ToeicProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly progressRepo: Repository<UserProgress>,
  ) { }

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
      isCompleted: false
    });

    return this.progressRepo.save(progress);
  }

  // Fetch the last progress
  async getLastProgress(userMezonId: string): Promise<UserProgress | null> {
    return this.progressRepo.findOne({
      where: { user: { mezonUserId: userMezonId } },
      order: { lastUpdated: 'DESC' },
      relations: ['test', 'part', 'currentQuestion'],
    });
  }

  async deleteProgress(userId: number, testId: number, partId: number) {
    await this.progressRepo.delete({ user: { id: userId }, test: { id: testId }, part: { id: partId } });
  }

  async markCompleted(progressId: number) {
    await this.progressRepo.update(progressId, { isCompleted: true });
  }
}
