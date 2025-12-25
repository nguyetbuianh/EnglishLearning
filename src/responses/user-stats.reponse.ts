import { User } from "../entities/user.entity";

export class UserStatsResponse {
  id: number;
  user: User;
  userId: number;
  totalAnswers: number;
  correctAnswers: number;
  points: number;
  streakDays: number;
  lastAnswerDate: Date;
  badges: string[];
}