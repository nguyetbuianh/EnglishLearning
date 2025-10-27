import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DailyPracticeAnswer } from "src/entities/daily-practice-answer.entity";
import { DailyAnswerService } from "./services/daily-answer.service";
import { UserStats } from "src/entities/user-stat.entity";
import { UserStatService } from "./services/user-stat.service";
import { ToeicModule } from "../toeic/toeic.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyPracticeAnswer, UserStats]),
    ToeicModule
  ],
  providers: [DailyAnswerService, UserStatService],
  exports: [DailyAnswerService, UserStatService],
})
export class DailyModule { }
