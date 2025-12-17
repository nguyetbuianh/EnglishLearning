import { IsNotEmpty, IsString } from "class-validator";

export class TranslateDto {
  @IsString()
  @IsNotEmpty({ message: 'word is required' })
  word: string;
}