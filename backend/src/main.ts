import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LogsService } from './logs/logs.service';
import { SettingsService } from './settings/settings.service';
import { runtimeFlags } from './settings/settings.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  // --- Custom CORS middleware -------------------------------------------
  // We deliberately do NOT use Nest's built-in app.enableCors() because it
  // would blanket-add Access-Control-Allow-Origin to every response,
  // making it impossible to genuinely reproduce Issue #3 ("Video not
  // playing -> CORS issue"). Instead we hand-roll CORS here so the
  // /video/:id/manifest route can have its header conditionally and
  // realistically omitted, driven by a live toggle in the Support
  // Dashboard (Settings.videoCorsErrorEnabled).
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const isSimulatedCorsRoute = /^\/video\/.+\/manifest/.test(req.path);
    const shouldOmitCors = isSimulatedCorsRoute && runtimeFlags.videoCorsErrorEnabled;

    if (!shouldOmitCors && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      // Also intentionally fail preflight for the simulated route so the
      // browser blocks the request before it even reaches the handler.
      if (shouldOmitCors) return res.status(204).end();
      return res.status(204).end();
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(app.get(LogsService)));

  // Warm the in-memory CORS flag from the DB on boot so a server restart
  // doesn't silently reset the support engineer's toggle state.
  await app.get(SettingsService).get();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 LMS Support Platform API running on http://localhost:${port}`);
}

bootstrap();
