import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../entities/user.entity";
import { UserService } from "./user.service";
import { ToeicModule } from "../toeic/toeic.module";
import { UserController } from "./user.controller";
import { StatService } from "../stat/stat.service";
import { UserStats } from "../../entities/user-stat.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User,
      UserStats
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    StatService
  ],
  exports: [
    UserService,
    StatService,
  ],
})
export class UserModule { }
