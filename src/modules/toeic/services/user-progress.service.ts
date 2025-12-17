import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from '../../../entities/progress.entity';
import { UserInterface } from '../../../interfaces/user.interface';
import { PartProgressDetailResponse, ProgressDetailResponse } from '../../../responses/part-progress-detail.response';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly userProgressRepo: Repository<UserProgress>,
  ) { }

  async getProgress(
    testId: number,
    partId: number,
    userMezonId: string
  ): Promise<UserProgress | null> {
    return this.userProgressRepo.findOne({
      where: {
        userMezonId,
        test: { id: testId },
        part: { id: partId },
      },
      relations: ['test', 'part'],
    });
  }

  async getProgressTest(
    testId: number,
    userMezonId: string
  ): Promise<UserProgress[] | null> {
    return this.userProgressRepo.find({
      where: {
        userMezonId,
        test: { id: testId },
      },
      relations: ['test', 'part'],
    });
  }

  async saveProgress(data: {
    userMezonId: string;
    testId: number;
    partId: number;
    currentQuestionNumber?: number;
    currentPassageNumber?: number;
    isCompleted?: boolean;
  }) {
    const existing = await this.userProgressRepo.findOne({
      where: {
        userMezonId: data.userMezonId,
        test: { id: data.testId },
        part: { id: data.partId },
      },
    });

    if (existing) {
      let updateData: Partial<UserProgress> = {};

      if (data.currentQuestionNumber !== undefined) {
        updateData.currentQuestionNumber = data.currentQuestionNumber;
      }
      if (data.currentPassageNumber !== undefined) {
        updateData.currentPassageNumber = data.currentPassageNumber;
      }
      if (data.isCompleted !== undefined) {
        updateData.isCompleted = data.isCompleted;
      }

      return await this.userProgressRepo.update(existing.id, updateData);
    }

    const newProgress = this.userProgressRepo.create({
      userMezonId: data.userMezonId,
      test: { id: data.testId },
      part: { id: data.partId },
      currentQuestionNumber: data.currentQuestionNumber,
      currentPassageNumber: data.currentPassageNumber,
      isCompleted: data.isCompleted,
    });

    return await this.userProgressRepo.save(newProgress);
  }

  async hasCompletedAllParts(userMezonId: string, testId: number): Promise<boolean> {
    const progresses = await this.userProgressRepo.find({
      where: {
        userMezonId,
        test: { id: testId },
        isCompleted: true
      },
    });

    return progresses.length >= 7;
  }

  async getProgressByUserId(userMezonId: string): Promise<UserProgress[]> {
    return await this.userProgressRepo.find({
      where: {
        userMezonId
      },
      relations: ['test', 'part']
    })
  }

  async deleteProgress(testId: number, partId: number, userMezonId: string) {
    return this.userProgressRepo
      .createQueryBuilder()
      .delete()
      .from(UserProgress)
      .where(
        'user_mezon_id = :userMezonId AND test_id = :testId AND part_id = :partId',
        { userMezonId, testId, partId },
      )
      .execute();
  }

  async getTestWithProgress(
    user: UserInterface
  ): Promise<Map<number, number | null>> {

    const { userMezonId } = user;

    const userProgress =
      await this.getProgressByUserId(userMezonId);

    const progressMap = new Map<number, number | null>();

    const grouped = new Map<number, { total: number; completed: number }>();

    for (const progress of userProgress) {
      const testId = progress.testId;

      if (!grouped.has(testId)) {
        grouped.set(testId, { total: 0, completed: 0 });
      }

      const stat = grouped.get(testId)!;
      stat.total += 1;

      if (progress.isCompleted) {
        stat.completed += 1;
      }
    }

    for (const [testId, stat] of grouped.entries()) {
      if (stat.total === 0) {
        progressMap.set(testId, null);
      } else if (stat.completed === 0) {
        progressMap.set(testId, 0);
      } else {
        progressMap.set(testId, stat.completed);
      }
    }

    return progressMap;
  }

  async getTestDetailProgress(
    testId: number,
    userMezonId: string,
  ): Promise<ProgressDetailResponse> {
    const testProgress =
      await this.getProgressTest(testId, userMezonId);

    if (!testProgress || testProgress.length === 0) {
      throw NotFoundException;
    }

    const test = testProgress[0].test;

    return {
      test,
      parts: testProgress.map(p => ({
        partId: p.partId,
        partNumber: p.part.partNumber,
        partTitle: p.part.title,
        isCompleted: p.isCompleted,
      })),
    };
  }
}
