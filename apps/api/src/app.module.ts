import { Module } from '@nestjs/common';
import { AccountModule } from './account';
import { AppConfigModule } from './config';
import { DatabaseModule } from './database';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { LoggerModule } from './logger';
import { MonitoredServicesModule } from './monitored-services';
import { MonitoringModule } from './monitoring';
import { NotificationsModule } from './notifications';
import { ProjectsModule } from './projects';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    AuthModule,
    AccountModule,
    ProjectsModule,
    MonitoredServicesModule,
    MonitoringModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
