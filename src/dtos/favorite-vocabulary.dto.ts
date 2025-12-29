import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class FavoriteVocabularyDto {
  @Min(0)
  @IsNotEmpty({ message: 'topic is required' })
  vocabularyId: number;
}