import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { QuizSubmission, QuizSubmissionDocument } from './schemas/quiz-submission.schema';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizSubmission.name) private submissionModel: Model<QuizSubmissionDocument>,
    private readonly logsService: LogsService,
  ) {}

  findByCourse(courseId: string) {
    return this.quizModel.find({ courseId }).exec();
  }

  async submit(userId: string, quizId: string, answers: number[]) {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) throw new NotFoundException('Quiz not found');

    const total = quiz.questions.length;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct += 1;
    });
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

    const submission = await this.submissionModel.create({
      userId,
      quizId,
      answers,
      scorePercent,
    });

    await this.logsService.recordActivity({
      userId,
      action: 'QUIZ_SUBMIT',
      metadata: { quizId, scorePercent, courseId: quiz.courseId },
    });

    return submission;
  }

  createQuizSeed(courseId: string, questions: any[]) {
    return this.quizModel.create({ courseId, questions });
  }
}
