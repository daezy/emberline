import { Module } from '@nestjs/common';

import { MonitoredServicesModule } from '../monitored-services';
import { NotificationsModule } from '../notifications';
import { QueueModule } from '../queue';
import { ChecksController } from './checks.controller';
import { CheckRetention } from './checks/check-retention';
import { CheckRunner } from './checks/check-runner';
import { CheckWorker } from './checks/check-worker';
import { EndpointProbe } from './probe/endpoint-probe';
import { CheckScheduler } from './scheduling/check-scheduler';
import { WarmPoliciesService } from './scheduling/warm-policies.service';
import { WarmPoliciesController } from './warm-policies.controller';

@Module({
  imports: [QueueModule, NotificationsModule, MonitoredServicesModule],
  controllers: [ChecksController, WarmPoliciesController],
  providers: [
    EndpointProbe,
    CheckRunner,
    CheckWorker,
    CheckScheduler,
    CheckRetention,
    WarmPoliciesService,
  ],
})
export class MonitoringModule {}
