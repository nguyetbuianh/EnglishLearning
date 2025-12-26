import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Topic } from "../../entities/topic.entity";
import { TopicService } from "./topic.service";
import { TopicController } from "./topic.controller";
import { VocabularyModule } from "../vocabulary/vocabulary.module";
import { UserService } from "../user/user.service";
import { StatService } from "../stat/stat.service";
import { UserModule } from "../user/user.module";
import { StatModule } from "../stat/stat.module";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { UserStats } from "../../entities/user-stat.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Topic,
      Vocabulary,
      UserStats
    ]),
    VocabularyModule,
    UserModule,
    StatModule
  ],
  controllers: [
    TopicController
  ],
  providers: [
    TopicService
  ],
  exports: [
    TopicService
  ]
})
export class TopicModule { }