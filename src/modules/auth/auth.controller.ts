import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInResponse } from "../../responses/sign-in.response";
import { AuthDto } from "../../dtos/auth.dto";

@Controller('oauth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('/login')
  async login(
    @Body() authDto: AuthDto,
  ): Promise<SignInResponse> {
    const returnData = await this.authService.exchangeCode(authDto.code, authDto.state);

    const userRes = await this.authService.userInfo(returnData.access_token);
    return await this.authService.signIn(userRes.user_id, userRes.display_name);;
  }

}