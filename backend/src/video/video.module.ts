import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { SettingsModule } from '../settings/settings.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [SettingsModule, CoursesModule, EnrollmentsModule, LogsModule],
  controllers: [VideoController],
})
export class VideoModule {}
