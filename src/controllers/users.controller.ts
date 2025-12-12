import {
  Controller,
  Get,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserProcessService } from '../services/user-process.service';
import { ApiResponseData } from '../decorators/api-data-response.decorator';
import { ResponseDto } from '../dtos/response.dto';
import { UserProgressByTestDto } from '../dtos/user-progress.dto';
import { UserProfileDto } from '../dtos/user-profile.dto';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private userProcessService: UserProcessService
  ) { }

  // GET /users/progress
  @Get('/progress')
  @ApiResponseData(UserProgressByTestDto, true)
  async findUserProgress(
    @Request() req,
  ): Promise<ResponseDto<UserProgressByTestDto[]>> {
    const { userId, userMezonId } = req.user;

    const userProgress = await this.userProcessService.buildUserProgress({ userId, userMezonId });

    return {
      success: true,
      message: 'Fetched user progress successfully',
      data: userProgress
    }
  }

  // GET /users/profile
  @Get('/profile')
  @ApiResponseData(UserProfileDto)
  async findUserProfile(
    @Request() req,
  ): Promise<ResponseDto<UserProfileDto>> {
    const { userId, userMezonId } = req.user;

    const userProfile = await this.userProcessService.getUserProfile({ userId, userMezonId });

    return {
      success: true,
      message: 'Fetched user profile successfully',
      data: userProfile
    }
  }
}
