import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';
import { ApiLog, ApiLogSchema } from './schemas/api-log.schema';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: ApiLog.name, schema: ApiLogSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
