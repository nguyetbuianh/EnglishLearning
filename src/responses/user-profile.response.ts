import { ApiProperty } from '@nestjs/swagger';

export class UserProfileReponse {
  @ApiProperty()
  username: string;

  @ApiProperty()
  formattedJoinDate: string;

  @ApiProperty({ type: [String] })
  badges: string[];

  @ApiProperty()
  points: number;

  @ApiProperty()
  streakDays?: number;
}
