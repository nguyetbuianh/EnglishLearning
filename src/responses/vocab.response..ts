import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class VocabularyResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  word: string;

  @ApiProperty()
  @Expose()
  pronounce: string;

  @ApiProperty()
  @Expose()
  partOfSpeech: string;

  @ApiProperty()
  @Expose()
  meaning: string;

  @ApiProperty()
  @Expose()
  exampleSentence: string;
}

export class FavVocabResponse {
  @ApiProperty({ type: VocabularyResponse })
  @Expose()
  @Type(() => VocabularyResponse)
  vocabulary: VocabularyResponse;
}