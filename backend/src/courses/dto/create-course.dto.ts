import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsString()
  instructor: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @IsOptional()
  @IsInt()
  maxSeats?: number;
}
