import { Module } from "@nestjs/common";
import { FeedbackController } from "./user-feedback.controller";
import { FeedbackService } from "./user-feedback. service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Feedback } from "../../entities/feedback.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feedback
    ])
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule { }
