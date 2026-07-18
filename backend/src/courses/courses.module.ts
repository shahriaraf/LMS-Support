import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]), LogsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
