import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from '../../../entities/progress.entity';

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

  async getProgressByUser(
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
}
