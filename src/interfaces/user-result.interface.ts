import { OptionEnum } from "../enum/option.enum";

export interface UserResultInterface {
  testId: number,
  userId: string,
  score: {
    listeningScore: number,
    readingScore: number,
    totalScore: number,
  },
  parts: {
    partNumber: number;
    correct: number;
    total: number;
    questions: {
      questionNumber: number;
      chosenOption: string;
      correctOption: string;
      isCorrect: boolean;
    }[];
  }[];
}


export interface QuestionResultInterface {
  questionNumber: number,
  chosenOption: OptionEnum,
  correctOption: OptionEnum,
  isCorrect: boolean,
}