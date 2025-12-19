import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { UserProfileReponse } from "../../responses/user-profile.response";
import { SimpleResponse } from "../../responses/pagination.response";


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/profile')
  @ApiOkResponse({ type: SimpleResponse<UserProfileReponse> })
  async getUserProfile(
    @Request() req,
  ): Promise<SimpleResponse<UserProfileReponse>> {
    const { userId } = req.user;
    const userProfile = await this.userService.getUserProfile(userId);

    return {
      data: userProfile
    };
  }
}