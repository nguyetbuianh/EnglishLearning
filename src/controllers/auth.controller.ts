import { Body, Controller, Get, Post, Query, Redirect, Res } from "@nestjs/common";
import { AuthService } from "../modules/auth/auth.service";
import { AuthDto } from "../dtos/auth.dto";

@Controller('oauth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('/login')
  async login(
    @Body() body: {
      code: string;
      state: string;
    },
  ) {
    const returnData = await this.authService.exchangeCode(body.code, body.state);

    const userRes = await this.authService.userInfo(returnData.access_token);

    return await this.authService.signIn(userRes.user_id, userRes.display_name);
  }

}