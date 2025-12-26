import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { StatService } from './stat.service';
import { SimpleResponse } from '../../responses/pagination.response';
import { UserStatsResponse, UserStreakResponse } from '../../responses/user-stats.reponse';


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('user-stats')
export class StatController {
  constructor(
    private readonly statService: StatService,
  ) { }

  @Get('streak')
  @ApiOkResponse({ type: SimpleResponse<UserStatsResponse> })
  async getStreak(@Request() req): Promise<SimpleResponse<UserStreakResponse>> {
    const { userId } = req.user;

    const stats = await this.statService.findUserStats(userId);
    const todayStr = this.statService.toDateString(new Date());
    const lastAnswerStr = stats.lastAnswerDate
      ? this.statService.toDateString(stats.lastAnswerDate)
      : null;

    return {
      data: {
        streakDays: stats.streakDays,
        todayStreak: lastAnswerStr === todayStr,
      }
    }
  }

  @Post('streak')
  @ApiOkResponse({ type: SimpleResponse<UserStreakResponse> })
  async updateStreak(@Request() req): Promise<SimpleResponse<UserStreakResponse>> {
    const { userId } = req.user;

    const stats = await this.statService.findUserStats(userId);
    const today = new Date();
    const todayStr = this.statService.toDateString(today);
    const updatedStats = await this.statService.updateDailyStreak(stats, today, userId);
    const lastAnswerStr = updatedStats.lastAnswerDate
      ? this.statService.toDateString(updatedStats.lastAnswerDate)
      : null;

    return {
      data: {
        streakDays: updatedStats.streakDays,
        todayStreak: lastAnswerStr === todayStr,
      }
    }
  }
}
