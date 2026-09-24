import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects';
import { QueueModule } from '../queue';
import { MonitoredServicesController } from './monitored-services.controller';
import { MonitoredServicesService } from './monitored-services.service';

@Module({
  imports: [ProjectsModule, QueueModule],
  controllers: [MonitoredServicesController],
  providers: [MonitoredServicesService],
  exports: [MonitoredServicesService],
})
export class MonitoredServicesModule {}
