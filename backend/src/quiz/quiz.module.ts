import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizSubmission, QuizSubmissionSchema } from './schemas/quiz-submission.schema';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
    ]),
    LogsModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
