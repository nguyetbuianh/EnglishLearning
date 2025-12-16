import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Topic } from "../../entities/topic.entity";
import { TopicService } from "./topic.service";
import { TopicsController } from "../../controllers/topics.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Topic
    ])
  ],
  controllers: [
    TopicsController
  ],
  providers: [
    TopicService
  ],
  exports: [
    TopicService
  ]
})
export class TopicModule { }