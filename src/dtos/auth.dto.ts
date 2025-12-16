import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'state is required' })
  state: string;

  @IsString()
  scope?: string;
}
