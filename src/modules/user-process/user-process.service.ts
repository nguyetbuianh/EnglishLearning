import { Injectable, NotFoundException } from "@nestjs/common";
import { Parts } from "../../interfaces/parts.interface";
import { UserProgressService } from "../toeic/services/user-progress.service";
import { UserAnswerService } from "../toeic/services/user-answer.service";
import { TOEIC_PART } from "../../contants/toeic-part.contant";
import { UserProgress } from "../../entities/progress.entity";
import { UserInterface } from "../../interfaces/user.interface";
import { UserProgressByTest } from "../../interfaces/user-progress.interface";
import { UserService } from "../user/user.service";
import { getJoinAt } from "../mezon/utils/date.util";
import { StatService } from "../stat/stat.service";
import { UserProgressByTestResponse } from "../../responses/user-progress.response";
import { UserProfileReponse } from "../../responses/user-profile.response";
import { InjectRepository } from "@nestjs/typeorm";
import { UserStats } from "../../entities/user-stat.entity";
import { Repository } from "typeorm";
import { UserStatsResponse } from "../../responses/user-stats.reponse";

@Injectable()
export class UserProcessService {
  constructor(
    private readonly userProgressService: UserProgressService,
    private readonly userAnswerService: UserAnswerService,
    private readonly userService: UserService,
    private readonly statService: StatService,
    @InjectRepository(UserStats)
    private readonly userStatsRepo: Repository<UserStats>,
  ) { }

  async buildUserProgress(userParams: UserInterface): Promise<UserProgressByTestResponse[]> {
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

  async getUserProfile(userParams: UserInterface): Promise<UserProfileReponse> {
    const { userId, userMezonId } = userParams;
    const user = await this.userService.getUser(userMezonId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const formattedJoinDate = getJoinAt(user.joinedAt);

    const userStat = await this.statService.findUserStats(userId);
    const badges = userStat?.badges ?? [];
    const points = userStat?.points ?? 0;
    const streakDays = userStat?.streakDays ?? 0;

    return {
      username: user.username,
      formattedJoinDate,
      badges,
      points,
      streakDays,
    };
  }

  async getTop10HighestScores(): Promise<UserStatsResponse[]> {
    return await this.userStatsRepo.find({
      order: {
        points: "DESC"
      },
      relations: ['user'],
      take: 10
    });
  }

  async getTop10HighestStreakDay(): Promise<UserStatsResponse[]> {
    return await this.userStatsRepo.find({
      order: {
        streakDays: "DESC"
      },
      relations: ['user'],
      take: 10
    });
  }
}
