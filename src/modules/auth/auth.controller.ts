import { Controller, Get, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInResponse } from "../../responses/sign-in.response";
import { AuthDto } from "../../dtos/auth.dto";
import { ApiOkResponse } from "@nestjs/swagger";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Get('/login/callback')
  @ApiOkResponse({ type: SignInResponse })
  async login(
    @Query() authDto: AuthDto,
  ): Promise<SignInResponse> {
    const { code, state, scope } = authDto;

    const returnData = await this.authService.exchangeCode(code, state);

    const userRes = await this.authService.userInfo(returnData.access_token);

    const jwt = await this.authService.signIn(userRes.user_id, userRes.display_name);

    return jwt;
  }

}