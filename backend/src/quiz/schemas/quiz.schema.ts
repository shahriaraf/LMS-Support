import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctIndex: number;
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  courseId: string;

  @Prop({ type: [Object], required: true })
  questions: QuizQuestion[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
