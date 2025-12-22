import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from "class-validator";

export class FlashcardDto {
  @IsString()
  @IsNotEmpty({ message: 'word is required' })
  word: string;

  @IsString()
  @IsNotEmpty({ message: 'pronounce is required' })
  pronounce: string;

  @IsString()
  @IsNotEmpty({ message: 'part of speech is required' })
  partOfSpeech: string;

  @IsString()
  @IsNotEmpty({ message: 'meaning is required' })
  meaning: string;

  @IsString()
  @IsNotEmpty({ message: 'example sentence is required' })
  exampleSentence: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'topic is required' })
  topicId: number;
}


export class VocabularyIdDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber()
  @ValidateNested({ each: true })
  vocabIds: number[];
}

