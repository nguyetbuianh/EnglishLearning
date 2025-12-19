import { ApiProperty } from "@nestjs/swagger";

export class GuessWordResponse {
  @ApiProperty()
  vocabId: number;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  maskedWord: string;
}

export class VerifyWordResponse {
  @ApiProperty()
  word: string;

  @ApiProperty()
  isCorrect: boolean;
}
