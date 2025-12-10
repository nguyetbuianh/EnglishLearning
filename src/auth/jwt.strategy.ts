import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from '../appConfig';

interface PAYLOAD {
  userId: number,
  userMezonId: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfig.jwt.secret || '',
    });
  }

  async validate(payload: PAYLOAD) {
    return { userId: payload.userId, userMezonId: payload.userMezonId };
  }
}
