import { ApiProperty } from "@nestjs/swagger";
import { VocabularyResponse } from "./vocab.response.";
import { PaginationResponse } from "./pagination.response";

export class TopicResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}

export class VocabPaginationResponse {
  items: VocabularyResponse[];
  pagination: PaginationResponse;
}