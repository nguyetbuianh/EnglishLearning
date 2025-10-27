import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from 'src/entities/progress.entity';

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


  async createProgress(data: {
    userMezonId: string;
    testId: number;
    partId: number;
    currentQuestionNumber: number;
    currentPassageNumber?: number;
  }) {
    const progress = this.userProgressRepo.create({
      userMezonId: data.userMezonId,
      test: { id: data.testId },
      part: { id: data.partId },
      currentQuestionNumber: data.currentQuestionNumber,
      currentPassageNumber: data.currentPassageNumber,
      isCompleted: false,
    });

    return this.userProgressRepo.save(progress);
  }

  async updateProgress(data: {
    userMezonId: string;
    testId: number;
    partId: number;
    currentQuestionNumber?: number;
    currentPassageNumber?: number;
    isCompleted?: boolean;
  }) {
    const progress = await this.userProgressRepo.findOne({
      where: {
        userMezonId: data.userMezonId,
        test: { id: data.testId },
        part: { id: data.partId },
      },
    });

    if (!progress) {
      throw new Error('User progress not found.');
    }

    if (data.currentQuestionNumber !== undefined) {
      progress.currentQuestionNumber = data.currentQuestionNumber;
    }

    if (data.currentPassageNumber !== undefined) {
      progress.currentPassageNumber = data.currentPassageNumber;
    }

    if (data.isCompleted !== undefined) {
      progress.isCompleted = data.isCompleted;
    }

    return this.userProgressRepo.save(progress);
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

}
