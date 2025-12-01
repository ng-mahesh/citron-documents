import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for admin login
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
