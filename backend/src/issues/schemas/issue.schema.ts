import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IssueDocument = HydratedDocument<Issue>;

export type IssueCategory =
  | 'COURSE_403'
  | 'PAYMENT_FAILURE'
  | 'VIDEO_CORS'
  | 'CSS_MISALIGNMENT'
  | 'ENROLLMENT_DB_ERROR'
  | 'OTHER';

export type IssueStatus = 'open' | 'investigating' | 'resolved';

@Schema({ timestamps: true })
export class Issue {
  @Prop({ required: true })
  reporterId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    enum: ['COURSE_403', 'PAYMENT_FAILURE', 'VIDEO_CORS', 'CSS_MISALIGNMENT', 'ENROLLMENT_DB_ERROR', 'OTHER'],
    default: 'OTHER',
  })
  category: IssueCategory;

  @Prop({ enum: ['open', 'investigating', 'resolved'], default: 'open' })
  status: IssueStatus;

  @Prop()
  relatedCourseId?: string;

  @Prop({ enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Prop()
  assignedTo?: string;

  @Prop()
  resolutionNotes?: string;

  @Prop()
  resolvedAt?: Date;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
