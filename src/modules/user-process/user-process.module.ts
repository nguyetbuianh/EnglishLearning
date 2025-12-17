import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { UserProcessService } from "./user-process.service";
import { UserProcessController } from "./user-process.controller";
import { ToeicModule } from "../toeic/toeic.module";
import { UserModule } from "../user/user.module";
import { StatModule } from "../stat/stat.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary
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