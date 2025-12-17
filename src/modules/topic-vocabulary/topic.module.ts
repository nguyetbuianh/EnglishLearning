import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Topic } from "../../entities/topic.entity";
import { TopicService } from "./topic.service";
import { TopicController } from "./topic.controller";
import { VocabularyModule } from "../vocabulary/vocabulary.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Topic
    ]),
    VocabularyModule
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