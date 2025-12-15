import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from './pagination.dto';

export class ResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data: T | null;

  @ApiProperty()
  pagination?: PaginationResponseDto;
}

