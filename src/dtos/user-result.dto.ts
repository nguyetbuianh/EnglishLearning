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

export class TopicTestQuestionResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  word: string;

  @ApiProperty()
  pronounce: string;

  @ApiProperty()
  partOfSpeech: string;

  @ApiProperty()
  isCorrect: boolean;
}

export class TopicTestResultDto {
  @ApiProperty()
  topicId: number;

  @ApiProperty()
  topicName: string;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  correctCount: number;

  @ApiProperty()
  scoreChange: number;

  @ApiProperty({ type: [TopicTestQuestionResultDto] })
  questions: TopicTestQuestionResultDto[];
}