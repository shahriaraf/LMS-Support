import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogsService } from '../../logs/logs.service';

/**
 * Records every API request/response into the ApiLog collection so the
 * Support Dashboard has a real, queryable request log (not fabricated
 * sample data). Errors are captured separately by AllExceptionsFilter.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();
    req.__startTime = start;

    return next.handle().pipe(
      tap((data) => {
        // Skip noisy log-reading endpoints so the dashboard doesn't log itself into a loop.
        if (req.url?.startsWith('/logs') || req.url?.startsWith('/issues')) return;

        this.logsService
          .recordApiLog({
            method: req.method,
            path: req.url,
            statusCode: context.switchToHttp().getResponse().statusCode,
            requestBody: this.safeBody(req.body),
            responseBody: this.truncate(data),
            userId: req.user?.userId ?? null,
            durationMs: Date.now() - start,
            isError: false,
          })
          .catch(() => undefined);
      }),
    );
  }

  private safeBody(body: any) {
    if (!body) return undefined;
    const clone = { ...body };
    if (clone.password) clone.password = '***';
    if (clone.cardNumber) clone.cardNumber = '**** **** **** ' + String(clone.cardNumber).slice(-4);
    return clone;
  }

  private truncate(data: any) {
    try {
      const str = JSON.stringify(data);
      if (!str) return undefined;
      return str.length > 2000 ? { truncated: true, preview: str.slice(0, 2000) } : data;
    } catch {
      return undefined;
    }
  }
}
