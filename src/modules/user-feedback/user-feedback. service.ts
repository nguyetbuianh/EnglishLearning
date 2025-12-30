import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { FeedbackInterface } from "../../interfaces/feedback.interface";

@Injectable()
export class FeedbackService {
  private readonly feedbackFile = path.join(
    process.cwd(),
    "src/data/feedback.json"
  );

  private async readFile(): Promise<FeedbackInterface[]> {
    try {
      const raw = await fs.readFile(this.feedbackFile, "utf-8");

      if (!raw.trim()) {
        await fs.writeFile(this.feedbackFile, "[]");
        return [];
      }

      return JSON.parse(raw);
    } catch (error) {
      await fs.writeFile(this.feedbackFile, "[]");
      return [];
    }
  }

  private async writeFile(data: FeedbackInterface[]): Promise<void> {
    await fs.writeFile(
      this.feedbackFile,
      JSON.stringify(data, null, 2)
    );
  }

  async createFeedback(message: string, userId: string): Promise<FeedbackInterface> {
    const feedbacks = await this.readFile();

    const newFeedback: FeedbackInterface = {
      id: uuidv4(),
      userId,
      message,
      createdAt: new Date().toISOString(),
    };

    feedbacks.push(newFeedback);
    await this.writeFile(feedbacks);

    return newFeedback;
  }
}
