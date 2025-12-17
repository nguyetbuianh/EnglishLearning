import { Expose } from 'class-transformer';

export class VocabularyResponse {
  @Expose()
  id: number;

  @Expose()
  word: string;

  @Expose()
  pronounce: string;

  @Expose()
  partOfSpeech: string;

  @Expose()
  meaning: string;

  @Expose()
  exampleSentence: string;
}
