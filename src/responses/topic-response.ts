import { ApiProperty } from "@nestjs/swagger";

export class TopicResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}