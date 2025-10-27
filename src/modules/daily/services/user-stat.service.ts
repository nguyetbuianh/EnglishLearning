import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserStats } from "src/entities/user-stat.entity";
import { User } from "src/entities/user.entity";
import { BadgeEnum } from "src/enum/badge.enum";
import { Repository } from "typeorm";

@Injectable()
export class UserStatService {
  constructor(
    @InjectRepository(UserStats)
    private readonly userStatsRepo: Repository<UserStats>,
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
    if (isCorrect) stats.points += 5;
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

  private async findUserStats(userId: number): Promise<UserStats | null> {
    return await this.userStatsRepo.findOne({
      where: { user: { id: userId } },
    });
  }

  private async createNewUserStats(
    userId: number,
    isCorrect: boolean,
    today: Date
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
    isCorrect: boolean,
    today: Date
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
}
