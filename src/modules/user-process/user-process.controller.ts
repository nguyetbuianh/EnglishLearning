import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UserProgressByTestResponse } from '../../responses/user-progress.response';
import { UserProfileReponse } from '../../responses/user-profile.response';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { UserProcessService } from './user-process.service';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserProcessController {
  constructor(
    private userProcessService: UserProcessService
  ) { }

  // GET /users/progress
  @Get('/progress')
  @ApiOkResponse({
    type: UserProgressByTestResponse,
    isArray: true
  })
  async findUserProgress(
    @Request() req,
  ): Promise<UserProgressByTestResponse[]> {
    const { userId, userMezonId } = req.user;
    const userProgress = await this.userProcessService.buildUserProgress({ userId, userMezonId });
    return userProgress;
  }

  // GET /users/profile
  @Get('/profile')
  @ApiOkResponse({ type: UserProfileReponse })
  async findUserProfile(
    @Request() req,
  ): Promise<UserProfileReponse> {
    const { userId, userMezonId } = req.user;
    const userProfile = await this.userProcessService.getUserProfile({ userId, userMezonId });
    return userProfile;
  }
}
