import {
  BadRequestException,
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserProgressService } from '../modules/toeic/services/user-progress.service';
import { Parts } from '../interfaces/parts.interface';
import { UserAnswerService } from '../modules/toeic/services/user-answer.service';
import { TOEIC_PART } from '../contants/toeic-part.contant';
import { getJoinAt } from '../modules/mezon/utils/date.util';
import { UserService } from '../modules/user/user.service';
import { UserStatService } from '../modules/daily/services/user-stat.service';
import { UserProfileInterface } from '../interfaces/user-profile.interface';


@Controller('users')
export class UsersController {
  constructor(
    private userProgressService: UserProgressService,
    private userAnswerService: UserAnswerService,
    private userService: UserService,
    private userStatService: UserStatService
  ) { }

  // GET /users/progress
  @Get('/progress')
  @UseGuards(JwtAuthGuard)
  async findUserProgress(
    @Req() req
  ) {
    const { userId, userMezonId } = req.user;
    if (!userId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }

    const userProgress = await this.userProgressService.getProgressByUserId(userMezonId);
    const progressByTest = new Map<number, { testId: number; parts: Parts[] }>();
    await Promise.all(
      userProgress.map(async (progress) => {
        try {
          const userAnswers = await this.userAnswerService.getUserAnswersByPartAndTest(
            progress.test.id,
            progress.part.id,
            userId);

          let attemptedCount = userAnswers.length;
          if (attemptedCount === 0) attemptedCount = 0;

          const correctCount = userAnswers.filter((a) => a.isCorrect).length;
          const totalInPart = TOEIC_PART[progress.part.partNumber];
          const percent = Math.round((correctCount / totalInPart) * 100);

          let testProgress = 0;
          if (attemptedCount === totalInPart) {
            testProgress++;
          }

          if (!progressByTest.has(progress.test.id)) {
            progressByTest.set(progress.test.id, {
              testId: progress.test.id,
              parts: [],
            });
          }

          progressByTest.get(progress.test.id)!.parts.push({
            partNumber: progress.part.partNumber,
            correctCount: correctCount,
            attemptedCount: attemptedCount,
            totalInPart: totalInPart,
            percent: percent,
          });
        } catch (err) {
          console.log(err);
        }
      })
    );
    return Array.from(progressByTest.values());
  }

  // GET /users/profile
  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async findUserProfile(
    @Req() req,
  ) {
    const { userId, userMezonId } = req.user;
    if (!userId || !userMezonId) {
      throw new BadRequestException("Missing required parameters");
    }

    const user = await this.userService.getUser(userMezonId);
    if (!user) {
      return;
    }

    const formattedJoinDate = await getJoinAt(user);
    const userStat = await this.userStatService.findUserStats(user.id);
    const badges = userStat ? userStat.badges : [];
    const points = userStat ? userStat.points : 0;

    const userProfile: UserProfileInterface = {
      formattedJoinDate,
      badges,
      points
    }

    return userProfile;
  }
}
