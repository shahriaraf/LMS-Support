import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Course, CourseSchema } from './schemas/course.schema';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_support_platform';
  await mongoose.connect(uri);
  const CourseModel = mongoose.model(Course.name, CourseSchema);

  await CourseModel.deleteMany({});

  await CourseModel.insertMany([
    {
      title: 'Introduction to Support Engineering',
      description:
        'Learn how to triage bug reports, read logs, and reproduce issues like a professional support engineer.',
      priceCents: 0,
      instructor: 'Ada Lovelace',
      isLocked: false,
      maxSeats: 0,
    },
    {
      title: 'Debugging REST APIs',
      description: 'A hands-on course covering status codes, CORS, and payment webhook failures.',
      priceCents: 1999,
      instructor: 'Grace Hopper',
      isLocked: false,
      maxSeats: 50,
    },
    {
      title: 'Advanced NestJS Architecture (Locked Demo)',
      description:
        'This course is intentionally flagged isLocked=true so you can reproduce the "Course not loading -> 403" issue from the Support Dashboard.',
      priceCents: 4999,
      instructor: 'Linus Torvalds',
      isLocked: true,
      maxSeats: 10,
    },
    {
      title: 'Full-Stack Payments with Stripe',
      description: 'Covers webhooks, retries, and idempotency for real-world payment systems.',
      priceCents: 2999,
      instructor: 'Margaret Hamilton',
      isLocked: false,
      maxSeats: 0,
    },
  ]);

  console.log('Seeded courses ✅');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
