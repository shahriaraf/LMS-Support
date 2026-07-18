import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { PaymentsModule } from './payments/payments.module';
import { QuizModule } from './quiz/quiz.module';
import { LogsModule } from './logs/logs.module';
import { IssuesModule } from './issues/issues.module';
import { SettingsModule } from './settings/settings.module';
import { VideoModule } from './video/video.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/lms_support_platform',
      }),
    }),
    LogsModule,
    SettingsModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    PaymentsModule,
    QuizModule,
    VideoModule,
    IssuesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
