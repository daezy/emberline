import { Module } from '@nestjs/common';
import { AppConfigModule } from './config';
import { DatabaseModule } from './database';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { LoggerModule } from './logger';
import { MonitoredServicesModule } from './monitored-services';
import { MonitoringModule } from './monitoring';
import { ProjectsModule } from './projects';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    MonitoredServicesModule,
    MonitoringModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
