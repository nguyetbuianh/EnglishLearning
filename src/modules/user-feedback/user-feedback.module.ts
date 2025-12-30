import { Module } from "@nestjs/common";
import { FeedbackController } from "./user-feedback.controller";
import { FeedbackService } from "./user-feedback. service";

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule { }
