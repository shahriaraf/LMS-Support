import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ required: false })
  userId?: string;

  @Prop({ required: true })
  action: string; // e.g. SIGNUP, LOGIN_SUCCESS, COURSE_VIEW, ENROLL_ATTEMPT, VIDEO_PLAY, QUIZ_SUBMIT

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
