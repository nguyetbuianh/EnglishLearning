import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class TopicResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}

export class TopicDetailResponse<T> extends TopicResponse {
  @ApiProperty()
  vocabs: T[];
}

export class TopicTestQuestionResult {
  @ApiProperty()
  id: number;

  @ApiProperty()
  word: string;

  @ApiProperty()
  pronounce: string;

  @ApiProperty()
  partOfSpeech: string;

  @ApiProperty()
  meaning: string;

  @ApiProperty()
  exampleSentence: string;

  @ApiProperty()
  userAnswer: string;

  @ApiProperty()
  isCorrect: boolean;
}

export class TopicTestResultResponse {
  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  correctCount: number;

  @ApiProperty()
  scoreChange: number;

  @ApiProperty({ type: [TopicTestQuestionResult] })
  @Type(() => TopicTestQuestionResult)
  questions: TopicTestQuestionResult[];
}