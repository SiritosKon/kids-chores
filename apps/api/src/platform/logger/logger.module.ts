import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { APP_CONFIG, type AppConfig } from '../config';
import { requestSummary, responseSummary } from './lib';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        pinoHttp: {
          level: config.LOG_LEVEL,
          serializers: { req: requestSummary, res: responseSummary },
        },
      }),
    }),
  ],
})
export class AppLoggerModule {}
