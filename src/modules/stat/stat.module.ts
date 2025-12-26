import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DailyPracticeAnswer } from "../../entities/daily-practice-answer.entity";
import { UserStats } from "../../entities/user-stat.entity";
import { StatService } from "./stat.service";
import { StatController } from "./stat.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyPracticeAnswer, UserStats]),
  ],
  controllers: [StatController],
  providers: [
    StatService
  ],
  exports: [
    StatService
  ],
})
export class StatModule { }
