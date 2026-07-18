import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { CoursesService } from '../courses/courses.service';
import { SettingsService } from '../settings/settings.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private readonly coursesService: CoursesService,
    private readonly settingsService: SettingsService,
    private readonly logsService: LogsService,
  ) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.coursesService.findByIdRaw(courseId);

    await this.logsService.recordActivity({
      userId,
      action: 'ENROLL_ATTEMPT',
      metadata: { courseId },
    });

    // Simulated Issue #5: "User cannot enroll -> Database validation error".
    // Toggled from the Support Dashboard via PATCH /settings.
    const settings = await this.settingsService.get();
    if (settings.enrollmentValidationErrorEnabled) {
      await this.logsService.recordActivity({
        userId,
        action: 'ENROLL_VALIDATION_ERROR',
        metadata: { courseId, reason: 'Simulated schema validation failure' },
      });
      throw new BadRequestException(
        'Enrollment.validate failed: courseId: Cast to ObjectId failed / seat allocation record missing required field "cohortId". (Simulated DB validation error - toggle off in Support Settings to resolve.)',
      );
    }

    if (course.maxSeats > 0) {
      const activeCount = await this.enrollmentModel.countDocuments({
        courseId,
        status: { $ne: 'cancelled' },
      });
      if (activeCount >= course.maxSeats) {
        throw new BadRequestException('This course is full. No seats remaining.');
      }
    }

    try {
      const enrollment = await this.enrollmentModel.create({
        userId,
        courseId,
        status: course.priceCents === 0 ? 'active' : 'pending_payment',
      });
      await this.logsService.recordActivity({
        userId,
        action: 'ENROLL_SUCCESS',
        metadata: { courseId, status: enrollment.status },
      });
      return enrollment;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('You are already enrolled in this course.');
      }
      throw err;
    }
  }

  findMine(userId: string) {
    return this.enrollmentModel.find({ userId }).exec();
  }

  async activate(userId: string, courseId: string) {
    return this.enrollmentModel
      .findOneAndUpdate(
        { userId, courseId },
        { status: 'active' },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  isEnrolled(userId: string, courseId: string) {
    return this.enrollmentModel.exists({ userId, courseId, status: 'active' });
  }

  findAll() {
    return this.enrollmentModel.find().sort({ createdAt: -1 }).limit(200).exec();
  }
}
