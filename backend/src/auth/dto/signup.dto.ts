import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Only exposed so we can seed a support_engineer account during demos.
  // In a real product this would never be client-settable.
  @IsOptional()
  @IsIn(['student', 'support_engineer'])
  role?: 'student' | 'support_engineer';
}
