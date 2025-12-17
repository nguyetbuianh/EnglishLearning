import { ApiProperty } from '@nestjs/swagger';

export class ToeicTestResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string | null;
}
