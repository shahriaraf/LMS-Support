import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly logsService: LogsService,
  ) {}

  findAll() {
    return this.courseModel.find().exec();
  }

  async findOne(id: string, userId?: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');

    // Simulated Issue #1: "Course not loading -> 403 error".
    // A course flagged isLocked deliberately produces a real 403 so the
    // support flow (report -> investigate logs -> unlock -> resolve) is genuine.
    if (course.isLocked) {
      await this.logsService.recordActivity({
        userId,
        action: 'COURSE_VIEW_BLOCKED_403',
        metadata: { courseId: id, title: course.title },
      });
      throw new ForbiddenException(
        `Access to "${course.title}" is currently restricted (course.isLocked=true).`,
      );
    }

    await this.logsService.recordActivity({
      userId,
      action: 'COURSE_VIEW',
      metadata: { courseId: id, title: course.title },
    });
    return course;
  }

  create(dto: CreateCourseDto) {
    return this.courseModel.create(dto);
  }

  async setLocked(id: string, isLocked: boolean) {
    const course = await this.courseModel.findByIdAndUpdate(id, { isLocked }, { new: true }).exec();
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findByIdRaw(id: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
