import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserStats } from "../../../entities/user-stat.entity";
import { User } from "../../../entities/user.entity";
import { BadgeEnum } from "../../../enum/badge.enum";
import { UserAnswerService } from "../../toeic/services/user-answer.service";
import { Repository } from "typeorm";

@Injectable()
export class UserStatService {
  private readonly POINT_CHANGE = 5;
  constructor(
    @InjectRepository(UserStats)
    private readonly userStatsRepo: Repository<UserStats>,
    private readonly userAnswerService: UserAnswerService
  ) { }

  private toDateString(date: Date | string): string {
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  }


  private getYesterday(date: Date): Date {
    const d = new Date(date);
    d.setDate(date.getDate() - 1);
    return d;
  }

  private updatePoints(stats: UserStats, isCorrect: boolean): void {
    stats.points += isCorrect ? this.POINT_CHANGE : -this.POINT_CHANGE;
    stats.points = Math.max(0, stats.points);
  }

  private updateAnswers(stats: UserStats, isCorrect: boolean): void {
    stats.totalAnswers += 1;
    if (isCorrect) stats.correctAnswers += 1;
  }

  private updateStreak(stats: UserStats, today: Date): void {
    const todayStr = this.toDateString(today);
    const lastAnswerStr = stats.lastAnswerDate
      ? this.toDateString(stats.lastAnswerDate)
      : null;

    const yesterdayStr = this.toDateString(this.getYesterday(today));

    if (lastAnswerStr === yesterdayStr) {
      stats.streakDays += 1;
    } else if (lastAnswerStr !== todayStr) {
      stats.streakDays = 1;
    }
  }

  async findUserStats(userId: number): Promise<UserStats | null> {
    return this.userStatsRepo.findOne({
      where: { user: { id: userId } },
    });
  }

  private async createNewUserStats(
    userId: number,
    isCorrect?: boolean,
    today?: Date
  ): Promise<UserStats> {
    const newStats = this.userStatsRepo.create({
      user: { id: userId } as User,
      totalAnswers: 1,
      correctAnswers: isCorrect ? 1 : 0,
      points: isCorrect ? 5 : 0,
      streakDays: 1,
      lastAnswerDate: today,
      badges: [],
    });

    return newStats;
  }

  private async getOrCreateUserStats(
    userId: number,
    isCorrect?: boolean,
    today?: Date
  ): Promise<UserStats> {
    let stats = await this.findUserStats(userId);
    if (!stats) {
      stats = await this.createNewUserStats(userId, isCorrect, today);
    }
    return stats;
  }

  async updateUserStats(userId: number, isCorrect: boolean): Promise<string[]> {
    const today = new Date();
    const stats = await this.getOrCreateUserStats(userId, isCorrect, today);

    const oldBadges = new Set(stats.badges || []);

    if (stats.id) {
      this.updateStreak(stats, today);
      this.updateAnswers(stats, isCorrect);
      this.updatePoints(stats, isCorrect);
      stats.lastAnswerDate = today;
      stats.badges = this.calculateBadges(stats);
    }

    await this.userStatsRepo.save(stats);

    const newBadges = stats.badges.filter(b => !oldBadges.has(b));
    return newBadges;
  }

  async updateUserStatsInApi(
    userId: number,
    {
      totalQuestions,
      correctCount,
      scoreChange,
    }: {
      totalQuestions: number;
      correctCount: number;
      scoreChange: number;
    }
  ): Promise<string[]> {
    const today = new Date();
    const stats = await this.getOrCreateUserStats(userId, undefined, today);

    const oldBadges = new Set(stats.badges || []);

    if (totalQuestions > 0) {
      this.updateStreak(stats, today);
    }

    stats.totalAnswers = (stats.totalAnswers || 0) + totalQuestions;
    stats.correctAnswers = (stats.correctAnswers || 0) + correctCount;
    stats.points = (stats.points || 0) + scoreChange;
    stats.lastAnswerDate = today;
    stats.badges = this.calculateBadges(stats);

    await this.userStatsRepo.save(stats);

    const newBadges = stats.badges.filter((b) => !oldBadges.has(b));
    return newBadges;
  }

  private calculateBadges(stats: UserStats): string[] {
    const badges = new Set(stats.badges || []);

    if (stats.correctAnswers >= 10) badges.add(BadgeEnum.MASTER_OF_10);
    if (stats.correctAnswers >= 50) badges.add(BadgeEnum.ACCURACY_PRO);
    if (stats.correctAnswers >= 100) badges.add(BadgeEnum.CORRECT_100);
    if (stats.correctAnswers >= 500) badges.add(BadgeEnum.CORRECT_500);

    if (stats.streakDays >= 7) badges.add(BadgeEnum.STREAK_7);
    if (stats.streakDays >= 30) badges.add(BadgeEnum.STREAK_30);

    if (stats.points >= 100) badges.add(BadgeEnum.CENTURY_PLAYER);
    if (stats.points >= 500) badges.add(BadgeEnum.POINTS_500);
    if (stats.points >= 1000) badges.add(BadgeEnum.POINTS_1000);

    return Array.from(badges);
  }

  async addPartScore(testId: number, partId: number, userId: number): Promise<string[]> {
    const userStat = await this.userStatsRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!userStat) return [];

    const answers = await this.userAnswerService.getUserAnswersByPartAndTest(
      testId,
      partId,
      userId
    );
    if (answers.length === 0) return [];

    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalCount = answers.length;
    const accuracy = (correctCount / totalCount) * 100;
    const partScore = Math.round((accuracy / 100) * 50);

    userStat.points += partScore;
    userStat.totalAnswers += totalCount;
    userStat.correctAnswers += correctCount;

    const oldBadges = new Set(userStat.badges || []);

    if (accuracy === 100) {
      userStat.badges = Array.from(
        new Set([...(userStat.badges || []), BadgeEnum.PERFECT_PART])
      );
    } else {
      userStat.badges = Array.from(
        new Set([...(userStat.badges || []), BadgeEnum.PART_FINISHER])
      );
    }

    await this.userStatsRepo.save(userStat);

    const newBadges = userStat.badges.filter(b => !oldBadges.has(b));
    return newBadges;
  }

  async addTestScore(testId: number, userId: number): Promise<string[]> {
    const userStat = await this.userStatsRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!userStat) return [];

    const answers = await this.userAnswerService.getUserAnswersByTest(userId, testId);
    if (answers.length === 0) return [];

    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalCount = answers.length;
    const accuracy = (correctCount / totalCount) * 100;

    const testScore = Math.round((accuracy / 100) * 200);

    userStat.points += testScore;
    userStat.totalAnswers += totalCount;
    userStat.correctAnswers += correctCount;

    const oldBadges = new Set(userStat.badges || []);

    if (accuracy === 100) {
      userStat.badges = Array.from(
        new Set([...(userStat.badges || []), BadgeEnum.PERFECT_TEST])
      );
    } else {
      userStat.badges = Array.from(
        new Set([...(userStat.badges || []), BadgeEnum.TEST_FINISHER])
      );
    }

    await this.userStatsRepo.save(userStat);

    const newBadges = userStat.badges.filter(b => !oldBadges.has(b));
    return newBadges;
  }
}
