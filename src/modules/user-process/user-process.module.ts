import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { UserProcessService } from "./user-process.service";
import { UserProcessController } from "./user-process.controller";
import { ToeicModule } from "../toeic/toeic.module";
import { UserModule } from "../user/user.module";
import { StatModule } from "../stat/stat.module";
import { UserStats } from "../../entities/user-stat.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary,
      UserStats
    ]),
    ToeicModule,
    UserModule,
    StatModule
  ],
  controllers: [
    UserProcessController
  ],
  providers: [
    UserProcessService
  ],
  exports: [
    UserProcessService
  ]
})
export class UserProcessModule { }