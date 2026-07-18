import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from './schemas/issue.schema';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { SettingsModule } from '../settings/settings.module';
import { CoursesModule } from '../courses/courses.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Issue.name, schema: IssueSchema }]),
    SettingsModule,
    CoursesModule,
    LogsModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
