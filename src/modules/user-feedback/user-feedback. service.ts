import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { FeedbackInterface } from "../../interfaces/feedback.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Feedback } from "../../entities/feedback.entity";
import { Repository } from "typeorm";

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
  ) { }

  async createFeedback(message: string, userId: string): Promise<FeedbackInterface> {
    const feedback: FeedbackInterface = {
      userId,
      message: message,
      createdAt: new Date().toDateString(),
    };
    return this.feedbackRepo.save(feedback);
  }
}
