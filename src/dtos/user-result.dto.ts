import { ApiProperty } from '@nestjs/swagger';

export class QuestionResultDto {
  @ApiProperty()
  questionNumber: number;

  @ApiProperty()
  chosenOption: string;

  @ApiProperty()
  correctOption: string;

  @ApiProperty()
  isCorrect: boolean;
}

export class PartResultDto {
  @ApiProperty()
  partNumber: number;

  @ApiProperty()
  correct: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [QuestionResultDto] })
  questions: QuestionResultDto[];
}

export class ScoreResultDto {
  @ApiProperty()
  listeningScore: number;

  @ApiProperty()
  readingScore: number;

  @ApiProperty()
  totalScore: number;
}

export class UserResultDto {
  @ApiProperty()
  testTitle: string;

  @ApiProperty({ type: ScoreResultDto })
  score: ScoreResultDto;

  @ApiProperty({ type: [PartResultDto] })
  parts: PartResultDto[];
}
