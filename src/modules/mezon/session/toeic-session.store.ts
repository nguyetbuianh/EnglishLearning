export const ToeicSessionStore = new Map<
  string,
  {
    testId?: number;
    partId?: number;
    currentQuestionNumber?: number;
    currentPassageNumber?: number;
  }
>();