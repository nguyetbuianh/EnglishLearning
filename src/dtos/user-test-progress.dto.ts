export class UserProgressPartDto {
  partId: number;
  partNumber: number;
  currentQuestionNumber: number;
  currentPassageNumber: number | null;
  isCompleted: boolean;
}
