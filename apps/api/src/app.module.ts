import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config';
import { DatabaseModule } from './database';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { LoggerModule } from './logger';
import { MonitoredServicesModule } from './monitored-services';
import { ProjectsModule } from './projects';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    MonitoredServicesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
