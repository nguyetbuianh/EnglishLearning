import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { FeedbackService } from "./user-feedback. service";
import { CreateFeedbackDto } from "../../dtos/create-feedback.dto";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { ApiBearerAuth, ApiCreatedResponse } from "@nestjs/swagger";

@ApiBearerAuth('access-token')
@Controller("feedback")
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Post()
  @ApiCreatedResponse()
  async createFeedback(
    @Request() req,
    @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(
      dto.message,
      req.user?.userMezonId ?? null,
    );
  }
}
