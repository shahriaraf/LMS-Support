import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';
import { ApiLog, ApiLogDocument } from './schemas/api-log.schema';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(ApiLog.name) private apiLogModel: Model<ApiLogDocument>,
  ) {}

  recordActivity(data: { userId?: string; action: string; metadata?: Record<string, any> }) {
    return this.activityLogModel.create(data);
  }

  recordApiLog(data: {
    method: string;
    path: string;
    statusCode: number;
    requestBody?: any;
    responseBody?: any;
    userId?: string | null;
    durationMs?: number;
    isError: boolean;
  }) {
    return this.apiLogModel.create(data);
  }

  async getActivityLogs(params: { userId?: string; limit?: number }) {
    const query = params.userId ? { userId: params.userId } : {};
    return this.activityLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(params.limit ?? 100)
      .exec();
  }

  async getApiLogs(params: { onlyErrors?: boolean; path?: string; limit?: number }) {
    const query: any = {};
    if (params.onlyErrors) query.isError = true;
    if (params.path) query.path = { $regex: params.path, $options: 'i' };
    return this.apiLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(params.limit ?? 100)
      .exec();
  }

  async getErrorSummary() {
    const results = await this.apiLogModel.aggregate([
      { $match: { isError: true } },
      {
        $group: {
          _id: { path: '$path', statusCode: '$statusCode' },
          count: { $sum: 1 },
          lastSeen: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    return results.map((r) => ({
      path: r._id.path,
      statusCode: r._id.statusCode,
      count: r.count,
      lastSeen: r.lastSeen,
    }));
  }
}
