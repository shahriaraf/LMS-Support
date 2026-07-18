import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuizSubmissionDocument = HydratedDocument<QuizSubmission>;

@Schema({ timestamps: true })
export class QuizSubmission {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  quizId: string;

  @Prop({ type: [Number], required: true })
  answers: number[];

  @Prop({ required: true })
  scorePercent: number;
}

export const QuizSubmissionSchema = SchemaFactory.createForClass(QuizSubmission);
