import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogsService } from '../../logs/logs.service';

/**
 * Central exception filter.
 *
 * Every unhandled exception (including the ones we deliberately throw to
 * simulate LMS bugs - 403 on locked courses, 500 on failed payments, etc.)
 * flows through here. We persist it as an ApiLog entry so the Support
 * Dashboard can show real request/response pairs instead of mocked data.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private readonly logsService: LogsService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} -> ${status}: ${JSON.stringify(message)}`,
    );

    try {
      await this.logsService.recordApiLog({
        method: request.method,
        path: request.url,
        statusCode: status,
        requestBody: this.safeBody(request.body),
        responseBody: message,
        userId: (request as any).user?.userId ?? null,
        durationMs: (request as any).__startTime
          ? Date.now() - (request as any).__startTime
          : undefined,
        isError: true,
      });
    } catch (logErr) {
      this.logger.error('Failed to persist api log', logErr as any);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message:
        typeof message === 'string' ? message : (message as any).message || message,
    });
  }

  private safeBody(body: any) {
    if (!body) return undefined;
    const clone = { ...body };
    if (clone.password) clone.password = '***';
    if (clone.cardNumber) clone.cardNumber = '**** **** **** ' + String(clone.cardNumber).slice(-4);
    return clone;
  }
}
