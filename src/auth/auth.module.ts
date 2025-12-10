import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { appConfig } from '../appConfig';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.jwt.secret,
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule { }
