import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { QuestionWithUserAnswerResponse } from "./question-answer.response";

export class PartQuestionResponse {
  @ApiProperty()
  partId: number;

  @ApiProperty()
  partNumber: number;

  @ApiProperty({ type: () => QuestionWithUserAnswerResponse, isArray: true })
  @Type(() => QuestionWithUserAnswerResponse)
  questions: QuestionWithUserAnswerResponse[];
}


