import { Injectable, NotFoundException } from "@nestjs/common";
import { Parts } from "../interfaces/parts.interface";
import { UserProgressService } from "../modules/toeic/services/user-progress.service";
import { UserAnswerService } from "../modules/toeic/services/user-answer.service";
import { TOEIC_PART } from "../contants/toeic-part.contant";
import { UserProgress } from "../entities/progress.entity";
import { UserInterface } from "../interfaces/user.interface";
import { UserProgressByTest } from "../interfaces/user-progress.interface";
import { UserService } from "../modules/user/user.service";
import { getJoinAt } from "../modules/mezon/utils/date.util";
import { UserStatService } from "../modules/daily/services/user-stat.service";
import { UserProgressByTestDto } from "../dtos/user-progress.dto";
import { UserProfileDto } from "../dtos/user-profile.dto";

@Injectable()
export class UserProcessService {
  constructor(
    private readonly userProgressService: UserProgressService,
    private readonly userAnswerService: UserAnswerService,
    private readonly userService: UserService,
    private readonly userStatService: UserStatService
  ) { }

  async buildUserProgress(userParams: UserInterface): Promise<UserProgressByTestDto[]> {
    const { userId, userMezonId } = userParams;
    const userProgress = await this.userProgressService.getProgressByUserId(userMezonId);

    const progressByTest = new Map<number, UserProgressByTest>();

    await Promise.all(
      userProgress.map(async progress => {
        const partStats = await this.computePartStats(progress, userId);
        this.pushPartToTest(progressByTest, progress.test.id, partStats);
      })
    );

    return Array.from(progressByTest.values());
  }

  private async computePartStats(progress: UserProgress, userId: number): Promise<Parts> {
    const userAnswers = await this.userAnswerService.getUserAnswersByPartAndTest(
      progress.test.id,
      progress.part.id,
      userId
    );

    const attemptedCount = userAnswers.length;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;

    const partInfo = TOEIC_PART[progress.part.partNumber];
    const percent = partInfo.total
      ? Math.round((correctCount / partInfo.total) * 100)
      : 0;

    return {
      partNumber: progress.part.partNumber,
      correctCount,
      attemptedCount,
      totalInPart: partInfo.total,
      percent
    };
  }

  private pushPartToTest(
    map: Map<number, UserProgressByTest>,
    testId: number,
    part: Parts
  ) {
    if (!map.has(testId)) {
      map.set(testId, {
        testId,
        parts: [],
      });
    }

    map.get(testId)!.parts.push(part);
  }

  async getUserProfile(userParams: UserInterface): Promise<UserProfileDto> {
    const { userId, userMezonId } = userParams;
    const user = await this.userService.getUser(userMezonId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const formattedJoinDate = getJoinAt(user.joinedAt);

    const userStat = await this.userStatService.findUserStats(userId);
    const badges = userStat?.badges ?? [];
    const points = userStat?.points ?? 0;

    return {
      username: user.username,
      formattedJoinDate,
      badges,
      points,
    };
  }
}
