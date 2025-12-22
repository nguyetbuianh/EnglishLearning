import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInResponse } from "../../responses/sign-in.response";
import { AuthDto } from "../../dtos/auth.dto";
import { ApiOkResponse } from "@nestjs/swagger";

@Controller('oauth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('/login')
  async login(
    @Body() authDto: AuthDto,
  ): Promise<SignInResponse> {
    const { code, state } = authDto;

    const returnData = await this.authService.exchangeCode(code, state);

    const userRes = await this.authService.userInfo(returnData.access_token);
    return await this.authService.signIn(userRes.user_id, userRes.display_name);;
  }

  @Get('/redirect-oauth')
  async redirectOauth(): Promise<{ url: string }> {
    const oauthUrl = this.authService.getOauthUrl();
    return {
      url: oauthUrl
    };
  }
}