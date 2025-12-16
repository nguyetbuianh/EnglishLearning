import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UserProcessService } from '../services/user-process.service';
import { UserProgressByTestDto } from '../dtos/user-progress.dto';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private userProcessService: UserProcessService
  ) { }

  // GET /users/progress
  @Get('/progress')
  @ApiOkResponse({
    type: UserProgressByTestDto,
    isArray: true
  })
  async findUserProgress(
    @Request() req,
  ): Promise<UserProgressByTestDto[]> {
    const { userId, userMezonId } = req.user;
    const userProgress = await this.userProcessService.buildUserProgress({ userId, userMezonId });
    return userProgress;
  }

  // GET /users/profile
  @Get('/profile')
  @ApiOkResponse({ type: UserProfileDto })
  async findUserProfile(
    @Request() req,
  ): Promise<UserProfileDto> {
    const { userId, userMezonId } = req.user;
    const userProfile = await this.userProcessService.getUserProfile({ userId, userMezonId });
    return userProfile;
  }
}
