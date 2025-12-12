import { ApiProperty } from '@nestjs/swagger';

export class ToeicTestDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string | null;
}
