import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Quiz, QuizSchema } from './schemas/quiz.schema';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_support_platform';
  await mongoose.connect(uri);
  const CourseModel = mongoose.model(Course.name, CourseSchema);
  const QuizModel = mongoose.model(Quiz.name, QuizSchema);

  const course = await CourseModel.findOne({ title: 'Introduction to Support Engineering' });
  if (!course) {
    console.log('Run `npm run seed` (courses) first.');
    await mongoose.disconnect();
    return;
  }

  await QuizModel.deleteMany({ courseId: course.id });
  await QuizModel.create({
    courseId: course.id,
    questions: [
      {
        question: 'A user reports "the page shows a 403 error." What should you check first?',
        options: [
          'Whether the resource/course is flagged as locked or restricted',
          'The user\'s WiFi router',
          'The color scheme of the page',
          'Nothing, 403 errors are always false alarms',
        ],
        correctIndex: 0,
      },
      {
        question: 'A video fails to load and the browser console shows "blocked by CORS policy." What is the likely fix?',
        options: [
          'Restart the user\'s computer',
          'Add the correct Access-Control-Allow-Origin header on the server response',
          'Change the video file format',
          'Ask the user to disable their firewall',
        ],
        correctIndex: 1,
      },
      {
        question: 'Where should you look to confirm a payment actually failed at the gateway vs. never being sent?',
        options: [
          'The CSS stylesheet',
          'The API request/response logs for the /payments/charge endpoint',
          'The course description',
          'The user\'s browser bookmarks',
        ],
        correctIndex: 1,
      },
    ],
  });

  console.log('Seeded quiz ✅');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
