import { OptionEnum } from "../enum/option.enum";

export interface UserResultInterface {
  testTitle: string,
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

export interface PartStatInterface {
  correct: number;
  total: number;
  questions: QuestionResultInterface[];
}
