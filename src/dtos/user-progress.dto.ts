import { ApiProperty } from '@nestjs/swagger';
import { Parts } from '../interfaces/parts.interface';
import { PartsDto } from './parts.dto';

export class UserProgressByTestDto {
  @ApiProperty()
  testId: number;

  @ApiProperty({ type: () => [PartsDto] })
  parts: Parts[];
}
