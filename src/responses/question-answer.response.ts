import { ApiProperty } from "@nestjs/swagger";
import { Passage } from "../entities/passage.entity";
import { QuestionOption } from "../entities/question-option.entity";
import { ToeicPart } from "../entities/toeic-part.entity";
import { ToeicTest } from "../entities/toeic-test.entity";
import { OptionEnum } from "../enum/option.enum";
import { Expose, Type } from "class-transformer";

export class QuestionWithUserAnswerResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  test: ToeicTest

  @ApiProperty()
  @Expose()
  part: ToeicPart;

  @ApiProperty()
  @Expose()
  passage: Passage;

  @ApiProperty()
  @Expose()
  questionNumber: number;

  @ApiProperty()
  @Expose()
  questionText: string;

  @ApiProperty()
  @Expose()
  explanation: string;

  @ApiProperty()
  @Expose()
  imageUrl: string | null;

  @ApiProperty()
  @Expose()
  audioUrl: string | null;

  @ApiProperty({ type: () => QuestionOptionResponse })
  @Expose()
  @Type(() => QuestionOptionResponse)
  options: QuestionOptionResponse[];

  @ApiProperty()
  @Expose()
  userAnswer: OptionEnum | null;
}

export class QuestionOptionResponse {
  @ApiProperty()
  @Expose()
  optionLabel: OptionEnum;

  @ApiProperty()
  @Expose()
  optionText: string;
}