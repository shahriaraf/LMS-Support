import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 0 })
  priceCents: number;

  @Prop({ required: true })
  instructor: string;

  @Prop({ default: 'https://example.com/video-sample.mp4' })
  videoUrl: string;

  // Deliberately flips some courses "locked" so the LMS produces a real
  // 403 when a non-enrolled/blocked user tries to view content -
  // this is issue #1 from the brief ("Course not loading -> 403 error").
  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ default: 0 })
  maxSeats: number; // 0 = unlimited
}

export const CourseSchema = SchemaFactory.createForClass(Course);
