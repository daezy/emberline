import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects';
import { MonitoredServicesController } from './monitored-services.controller';
import { MonitoredServicesService } from './monitored-services.service';

@Module({
  imports: [ProjectsModule],
  controllers: [MonitoredServicesController],
  providers: [MonitoredServicesService],
  exports: [MonitoredServicesService],
})
export class MonitoredServicesModule {}
