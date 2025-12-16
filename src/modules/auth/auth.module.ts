import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthController } from "../../controllers/auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { User } from "../../entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { appConfig } from "../../appConfig";

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.jwt.secret,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([User]),
    UserModule,
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule { }