import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  courseId: string;

  @Prop({ enum: ['pending_payment', 'active', 'cancelled'], default: 'pending_payment' })
  status: 'pending_payment' | 'active' | 'cancelled';
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
