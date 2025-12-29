import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class FlashcardDto {
  @IsString()
  @IsNotEmpty({ message: 'word is required' })
  word: string;

  @IsString()
  @IsOptional()
  pronounce: string;

  @IsString()
  @IsNotEmpty({ message: 'part of speech is required' })
  partOfSpeech: string;

  @IsString()
  @IsNotEmpty({ message: 'meaning is required' })
  meaning: string;

  @IsString()
  @IsOptional()
  exampleSentence: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'topic is required' })
  topicId: number;
}

export class UpdateFlashcardDto {
  @IsString()
  @IsOptional()
  word: string;

  @IsString()
  @IsOptional()
  pronounce: string;

  @IsString()
  @IsOptional()
  partOfSpeech: string;

  @IsString()
  @IsOptional()
  meaning: string;

  @IsString()
  @IsOptional()
  exampleSentence: string;
}


export class VocabularyIdDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  vocabIds: number[];
}

