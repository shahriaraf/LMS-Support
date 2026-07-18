import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { IssueCategory } from '../schemas/issue.schema';

const CATEGORIES: IssueCategory[] = [
  'COURSE_403',
  'PAYMENT_FAILURE',
  'VIDEO_CORS',
  'CSS_MISALIGNMENT',
  'ENROLLMENT_DB_ERROR',
  'OTHER',
];

export class CreateIssueDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(CATEGORIES)
  category: IssueCategory;

  @IsOptional()
  @IsString()
  relatedCourseId?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
