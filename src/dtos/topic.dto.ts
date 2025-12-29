import { IsNotEmpty, IsString } from "class-validator";

export class TopicDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  type: string;

  @IsString()
  description: string;
}
