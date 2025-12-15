import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  formattedJoinDate: string;

  @ApiProperty({ type: [String] })
  badges: string[];

  @ApiProperty()
  points: number;
}
