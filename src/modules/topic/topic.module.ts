import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Topic } from "src/entities/topic.entity";
import { TopicService } from "./topic.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic])
  ],
  providers: [
    TopicService
  ],
  exports: []
})
export class TopicModule { }