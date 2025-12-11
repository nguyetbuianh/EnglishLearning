import { UserAnswersDto } from "../dtos/user-answer.dto";

export interface SubmitTestInterface {
  testId: number;
  partId: number;
  userId: number;
  userMezonId: string;
  submitAnswers: UserAnswersDto[];
}

export interface CheckCompletionInterface {
  partId: number;
  testId: number;
  userMezonId: string;
  submitAnswers: UserAnswersDto[];
  partAnsweredCount: number;
}

export interface SaveProgressInterface {
  userMezonId: string;
  testId: number;
  partId: number;
  currentQuestionNumber?: number;
  currentPassageNumber?: number;
  isCompleted?: boolean;
};


