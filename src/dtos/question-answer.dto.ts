import { Passage } from "../entities/passage.entity";
import { QuestionOption } from "../entities/question-option.entity";
import { ToeicPart } from "../entities/toeic-part.entity";
import { ToeicTest } from "../entities/toeic-test.entity";
import { OptionEnum } from "../enum/option.enum";

export class QuestionWithUserAnswerDto {
  id: number;
  test: ToeicTest
  part: ToeicPart;
  passage: Passage;
  questionNumber: number;
  questionText: string;
  correctOption: OptionEnum;
  explanation: string;
  imageUrl: string | null;
  audioUrl: string | null;
  options: QuestionOption[];
  userAnswer: OptionEnum | null;
}

