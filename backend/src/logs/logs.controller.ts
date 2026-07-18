import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LogsService } from './logs.service';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('support_engineer', 'admin')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('activity')
  getActivity(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    return this.logsService.getActivityLogs({ userId, limit: limit ? Number(limit) : undefined });
  }

  @Get('api')
  getApi(
    @Query('onlyErrors') onlyErrors?: string,
    @Query('path') path?: string,
    @Query('limit') limit?: string,
  ) {
    return this.logsService.getApiLogs({
      onlyErrors: onlyErrors === 'true',
      path,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('error-summary')
  getErrorSummary() {
    return this.logsService.getErrorSummary();
  }
}
