import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { User } from "../../entities/user.entity";
import { UserService } from "../user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException } from "@nestjs/common";
import { appConfig } from "../../appConfig";

interface ExchangeCodeData {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}
interface UserInfoData {
  aud: string[];
  auth_time: number;
  avatar: string;
  display_name: string;
  email: string;
  iat: number;
  iss: string;
  mezon_id: string;
  rat: number;
  sub: string;
  user_id: string;
  username: string;
}

export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) { }

  async exchangeCode(code: string, state: string): Promise<ExchangeCodeData> {
    const res = await fetch(`${appConfig.oauth.baseUri}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        state,
        client_id: appConfig.oauth.clientId,
        client_secret: appConfig.oauth.clientSecret,
        redirect_uri: appConfig.oauth.redirectUri,
        scope: 'openid offline',
      }),
    });

    const data: ExchangeCodeData = await res.json();

    return data
  }

  async signIn(
    mezonUserId: string,
    displayName: string
  ): Promise<{ access_token: string }> {
    const user = await this.userRepo.findOne({ where: { mezonUserId } });
    if (!user) {
      await this.userService.createUserByMezonId(mezonUserId, displayName);
    }

    const payload = { userId: user?.id, mezonUserId: user?.mezonUserId };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async userInfo(accessToken: string): Promise<UserInfoData> {
    const userRes = await fetch(`${appConfig.oauth.baseUri}/userinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: encodeURIComponent(accessToken),
        client_id: appConfig.oauth.clientId,
        client_secret: appConfig.oauth.clientSecret,
        redirect_uri: appConfig.oauth.redirectUri,
      })
    });
    if (!userRes.ok) {
      throw new BadRequestException('Failed to fetch user info');
    }

    const data: UserInfoData = await userRes.json();

    return data;
  }
}
